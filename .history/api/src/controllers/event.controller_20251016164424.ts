import { NextFunction, Request, Response } from "express";
import { responseBuilder } from "../utils/response.builder";
import { prisma } from "../libs/prisma";
import { EventCategory } from "../generated/prisma/client";

interface CreateEventRequest {
  name: string;
  description: string;
  category: EventCategory;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  isFree: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export default new (class EventController {
  // Get all events with filtering
  async getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 12, 
        search, 
        category, 
        location,
        startDate,
        endDate,
        minPrice,
        maxPrice
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        isActive: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { location: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (category && category !== 'all') {
        where.category = category as EventCategory;
      }

      if (location && location !== 'all') {
        where.location = { contains: location as string, mode: 'insensitive' };
      }

      if (startDate) {
        where.startDate = { gte: new Date(startDate as string) };
      }

      if (endDate) {
        where.endDate = { lte: new Date(endDate as string) };
      }

      if (minPrice !== undefined) {
        where.price = { ...where.price, gte: Number(minPrice) };
      }

      if (maxPrice !== undefined) {
        where.price = { ...where.price, lte: Number(maxPrice) };
      }

      // Get events with organizer info
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                reviews: true,
                transactions: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.event.count({ where }),
      ]);

      res.status(200).json(
        responseBuilder(200, "Events fetched successfully", {
          events,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        })
      );
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to fetch events", null)
      );
    }
  }

  // Get event by ID
  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.event.findFirst({
        where: {
          id: Number(id),
          isActive: true,
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          tickets: true,
          reviews: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              transactions: true,
              attendees: true,
            },
          },
        },
      });

      if (!event) {
        res.status(404).json(
          responseBuilder(404, "Event not found", null)
        );
        return;
      }

      res.status(200).json(
        responseBuilder(200, "Event fetched successfully", event)
      );
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to fetch event", null)
      );
    }
  }

  // Create new event (Organizer only)
  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(
          responseBuilder(401, "Authentication required", null)
        );
        return;
      }

      if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
        res.status(403).json(
          responseBuilder(403, "Only organizers can create events", null)
        );
        return;
      }

      const {
        name,
        description,
        category,
        location,
        address,
        startDate,
        endDate,
        price,
        availableSeats,
        totalSeats,
        isFree,
      }: CreateEventRequest = req.body;

      // Validation
      if (!name || !description || !category || !location || !address || !startDate || !endDate) {
        res.status(400).json(
          responseBuilder(400, "Missing required fields", null)
        );
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start <= now) {
        res.status(400).json(
          responseBuilder(400, "Start date must be in the future", null)
        );
        return;
      }

      if (end <= start) {
        res.status(400).json(
          responseBuilder(400, "End date must be after start date", null)
        );
        return;
      }

      if (!isFree && price <= 0) {
        res.status(400).json(
          responseBuilder(400, "Price must be greater than 0 for paid events", null)
        );
        return;
      }

      if (availableSeats > totalSeats) {
        res.status(400).json(
          responseBuilder(400, "Available seats cannot exceed total seats", null)
        );
        return;
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          name,
          description,
          category,
          location,
          address,
          startDate: start,
          endDate: end,
          price: isFree ? 0 : price,
          availableSeats,
          totalSeats,
          isFree,
          organizerId: req.user.id,
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(
        responseBuilder(201, "Event created successfully", { event })
      );
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to create event", null)
      );
    }
  }

  // Update event (Organizer only)
  async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(
          responseBuilder(401, "Authentication required", null)
        );
        return;
      }

      const { id } = req.params;
      const eventId = Number(id);

      // Check if event exists and user is the organizer
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: eventId,
          isActive: true,
        },
      });

      if (!existingEvent) {
        res.status(404).json(
          responseBuilder(404, "Event not found", null)
        );
        return;
      }

      if (existingEvent.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json(
          responseBuilder(403, "You can only update your own events", null)
        );
        return;
      }

      const {
        name,
        description,
        category,
        location,
        address,
        startDate,
        endDate,
        price,
        availableSeats,
        totalSeats,
        isFree,
      }: Partial<CreateEventRequest> = req.body;

      // Build update data
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (location !== undefined) updateData.location = location;
      if (address !== undefined) updateData.address = address;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (price !== undefined) updateData.price = price;
      if (availableSeats !== undefined) updateData.availableSeats = availableSeats;
      if (totalSeats !== undefined) updateData.totalSeats = totalSeats;
      if (isFree !== undefined) updateData.isFree = isFree;

      // Update event
      const event = await prisma.event.update({
        where: { id: eventId },
        data: updateData,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.status(200).json(
        responseBuilder(200, "Event updated successfully", { event })
      );
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to update event", null)
      );
    }
  }

  // Delete event (Organizer only)
  async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(
          responseBuilder(401, "Authentication required", null)
        );
        return;
      }

      const { id } = req.params;
      const eventId = Number(id);

      // Check if event exists and user is the organizer
      const existingEvent = await prisma.event.findFirst({
        where: {
          id: eventId,
          isActive: true,
        },
      });

      if (!existingEvent) {
        res.status(404).json(
          responseBuilder(404, "Event not found", null)
        );
        return;
      }

      if (existingEvent.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json(
          responseBuilder(403, "You can only delete your own events", null)
        );
        return;
      }

      // Soft delete - mark as inactive
      await prisma.event.update({
        where: { id: eventId },
        data: { isActive: false },
      });

      res.status(200).json(
        responseBuilder(200, "Event deleted successfully", null)
      );
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to delete event", null)
      );
    }
  }

  // Get organizer's events
  async getOrganizerEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(
          responseBuilder(401, "Authentication required", null)
        );
        return;
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: {
            organizerId: req.user.id,
            isActive: true,
          },
          include: {
            _count: {
              select: {
                transactions: true,
                attendees: true,
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.event.count({
          where: {
            organizerId: req.user.id,
            isActive: true,
          },
        }),
      ]);

      res.status(200).json(
        responseBuilder(200, "Organizer events fetched successfully", {
          events,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          },
        })
      );
    } catch (error) {
      console.error('Get organizer events error:', error);
      res.status(500).json(
        responseBuilder(500, "Failed to fetch organizer events", null)
      );
    }
  }
})();

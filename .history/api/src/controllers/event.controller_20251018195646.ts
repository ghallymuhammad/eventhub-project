import { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';

class EventController {
  /**
   * Get all events
   */
  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        category, 
        location, 
        search, 
        page = 1, 
        limit = 12,
        sortBy = 'startDate',
        sortOrder = 'asc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        status: 'PUBLISHED' // Only show published events to public
      };

      if (category && category !== 'all') {
        where.category = category;
      }

      if (location && location !== 'all') {
        where.location = {
          contains: location as string,
          mode: 'insensitive'
        };
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Get events with pagination
      const [events, totalCount] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy as string]: sortOrder
          },
          include: {
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: {
                transactions: true
              }
            }
          }
        }),
        prisma.event.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / take);

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            currentPage: Number(page),
            totalPages,
            totalCount,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get event by ID
   */
  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id: Number(id) },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true
            }
          },
          tickets: {
            select: {
              id: true,
              type: true,
              name: true,
              price: true
            }
          },
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new event (Organizers only)
   */
  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Check if user is organizer
      if (userRole !== 'ORGANIZER') {
        return res.status(403).json({
          success: false,
          message: 'Only organizers can create events'
        });
      }

      const {
        name,
        description,
        category,
        location,
        startDate,
        endDate,
        price,
        capacity,
        imageUrl
      } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start <= now) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be in the future'
        });
      }

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      // Create event
      const event = await prisma.event.create({
        data: {
          name,
          description,
          category,
          location,
          startDate: start,
          endDate: end,
          price: Number(price),
          capacity: Number(capacity),
          imageUrl: imageUrl || null,
          organizerId: userId,
          status: 'PUBLISHED' // Auto-publish for now
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update event (Organizer who created it only)
   */
  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: Number(id) }
      });

      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check permissions
      if (userRole !== 'ADMIN' && existingEvent.organizerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own events'
        });
      }

      const {
        name,
        description,
        category,
        location,
        startDate,
        endDate,
        price,
        capacity,
        imageUrl,
        status
      } = req.body;

      // Validate dates if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date'
          });
        }
      }

      // Update event
      const updatedEvent = await prisma.event.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(category && { category }),
          ...(location && { location }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          ...(price !== undefined && { price: Number(price) }),
          ...(capacity !== undefined && { capacity: Number(capacity) }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(status && { status })
        },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: updatedEvent
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete event (Organizer who created it only)
   */
  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              tickets: true
            }
          }
        }
      });

      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      // Check permissions
      if (userRole !== 'ADMIN' && existingEvent.organizerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own events'
        });
      }

      // Check if event has tickets sold
      if (existingEvent._count.tickets > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete event with sold tickets. Cancel the event instead.'
        });
      }

      // Delete event
      await prisma.event.delete({
        where: { id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get events by organizer (for organizer dashboard)
   */
  getOrganizerEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Check if user is organizer
      if (userRole !== 'ORGANIZER' && userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { page = 1, limit = 10, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      
      if (userRole === 'ORGANIZER') {
        where.organizerId = userId;
      }

      if (status) {
        where.status = status;
      }

      const [events, totalCount] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tickets: true
              }
            }
          }
        }),
        prisma.event.count({ where })
      ]);

      // Calculate statistics
      const stats = await prisma.event.aggregate({
        where: userRole === 'ORGANIZER' ? { organizerId: userId } : {},
        _count: { id: true },
        _sum: { capacity: true }
      });

      const totalTicketsSold = await prisma.ticket.count({
        where: {
          event: userRole === 'ORGANIZER' ? { organizerId: userId } : {}
        }
      });

      const totalRevenue = await prisma.ticket.aggregate({
        where: {
          event: userRole === 'ORGANIZER' ? { organizerId: userId } : {}
        },
        _sum: { totalAmount: true }
      });

      const totalPages = Math.ceil(totalCount / take);

      res.json({
        success: true,
        data: {
          events,
          stats: {
            totalEvents: stats._count.id || 0,
            totalCapacity: stats._sum.capacity || 0,
            totalTicketsSold,
            totalRevenue: totalRevenue._sum.totalAmount || 0
          },
          pagination: {
            currentPage: Number(page),
            totalPages,
            totalCount,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new EventController();

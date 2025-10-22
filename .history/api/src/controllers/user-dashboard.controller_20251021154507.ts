import { Request, Response } from 'express';
import prisma from '../libs/prisma';
import { ResponseBuilder } from '../utils/response.builder';

export class UserDashboardController {
  // Get user profile and dashboard data
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      // Get user with all dashboard data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          transactions: {
            include: {
              event: {
                select: {
                  id: true,
                  name: true,
                  startDate: true,
                  endDate: true,
                  location: true,
                  imageUrl: true,
                  category: true
                }
              },
              tickets: {
                include: {
                  ticket: {
                    select: {
                      id: true,
                      type: true,
                      price: true
                    }
                  }
                }
              },
              promotion: true,
              coupon: true,
              attendees: true
            },
            orderBy: { createdAt: 'desc' }
          },
          pointHistory: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          coupons: {
            where: {
              isUsed: false,
              expiryDate: { gte: new Date() }
            },
            include: {
              event: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json(
          ResponseBuilder.error('User not found', 'USER_NOT_FOUND')
        );
      }

      // Calculate statistics
      const completedTransactions = user.transactions.filter(
        t => t.status === 'DONE'
      );
      
      const totalSpent = completedTransactions.reduce(
        (sum, t) => sum + t.finalAmount, 0
      );

      const totalEvents = completedTransactions.length;
      
      const upcomingEvents = completedTransactions.filter(
        t => new Date(t.event.startDate) > new Date()
      );

      const pastEvents = completedTransactions.filter(
        t => new Date(t.event.endDate) < new Date()
      );

      const dashboardData = {
        profile: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          pointBalance: user.pointBalance,
          referralCode: user.referralCode,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        },
        statistics: {
          totalEvents,
          totalSpent,
          pointBalance: user.pointBalance,
          upcomingEventsCount: upcomingEvents.length,
          pastEventsCount: pastEvents.length,
          availableCoupons: user.coupons.length
        },
        transactions: user.transactions,
        pointHistory: user.pointHistory,
        coupons: user.coupons,
        upcomingEvents: upcomingEvents.map(t => t.event),
        pastEvents: pastEvents.map(t => t.event)
      };

      return res.json(
        ResponseBuilder.success(dashboardData, 'Dashboard data retrieved successfully')
      );

    } catch (error) {
      console.error('Error fetching user dashboard:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Get user's purchased tickets
  async getPurchasedTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { status, upcoming } = req.query;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      let whereClause: any = { userId };

      if (status) {
        whereClause.status = status;
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              description: true,
              startDate: true,
              endDate: true,
              location: true,
              imageUrl: true,
              category: true,
              organizer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          tickets: {
            include: {
              ticket: {
                select: {
                  id: true,
                  type: true,
                  price: true,
                  description: true
                }
              }
            }
          },
          promotion: true,
          coupon: true,
          attendees: true
        },
        orderBy: { createdAt: 'desc' }
      });

      let filteredTransactions = transactions;

      if (upcoming === 'true') {
        filteredTransactions = transactions.filter(
          t => new Date(t.event.startDateTime) > new Date()
        );
      } else if (upcoming === 'false') {
        filteredTransactions = transactions.filter(
          t => new Date(t.event.endDateTime) < new Date()
        );
      }

      return res.json(
        ResponseBuilder.success(filteredTransactions, 'Purchased tickets retrieved successfully')
      );

    } catch (error) {
      console.error('Error fetching purchased tickets:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Get user's point history
  async getPointHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [pointHistory, total] = await Promise.all([
        prisma.pointHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.pointHistory.count({
          where: { userId }
        })
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      return res.json(
        ResponseBuilder.success({
          pointHistory,
          pagination: {
            currentPage: Number(page),
            totalPages,
            total,
            hasNext: Number(page) < totalPages,
            hasPrev: Number(page) > 1
          }
        }, 'Point history retrieved successfully')
      );

    } catch (error) {
      console.error('Error fetching point history:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, phoneNumber } = req.body;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phoneNumber
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          avatar: true,
          pointBalance: true,
          referralCode: true,
          isVerified: true
        }
      });

      return res.json(
        ResponseBuilder.success(updatedUser, 'Profile updated successfully')
      );

    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Get user's available coupons
  async getCoupons(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      const coupons = await prisma.coupon.findMany({
        where: {
          userId,
          isUsed: false,
          expiryDate: { gte: new Date() }
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDateTime: true
            }
          }
        },
        orderBy: { expiryDate: 'asc' }
      });

      return res.json(
        ResponseBuilder.success(coupons, 'Coupons retrieved successfully')
      );

    } catch (error) {
      console.error('Error fetching coupons:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }
}

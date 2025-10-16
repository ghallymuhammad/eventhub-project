import { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';
import emailService from '../services/email.service';
import ticketGeneratorService from '../services/ticketGenerator.service';

export class TransactionController {
  /**
   * Create a new transaction
   */
  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { eventId, tickets, couponCode, pointsUsed } = req.body;

      // Get event details
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          tickets: true,
          promotions: {
            where: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
        },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Calculate total amount
      let totalAmount = 0;
      const transactionTickets: any[] = [];

      for (const ticketData of tickets) {
        const ticket = event.tickets.find((t) => t.id === ticketData.ticketId);
        if (!ticket) {
          return res.status(400).json({
            success: false,
            message: `Ticket ${ticketData.ticketId} not found`,
          });
        }

        // Check availability
        if (ticket.availableSeats < ticketData.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough seats available for ${ticket.name}`,
          });
        }

        const ticketTotal = ticket.price * ticketData.quantity;
        totalAmount += ticketTotal;
        transactionTickets.push({
          ticketId: ticket.id,
          quantity: ticketData.quantity,
          price: ticket.price,
        });
      }

      // Apply coupon if provided
      let couponId = null;
      let discount = 0;

      if (couponCode) {
        const coupon = await prisma.coupon.findFirst({
          where: {
            code: couponCode,
            userId,
            isUsed: false,
            expiryDate: { gte: new Date() },
          },
        });

        if (coupon) {
          if (coupon.eventId && coupon.eventId !== eventId) {
            return res.status(400).json({
              success: false,
              message: 'Coupon is not valid for this event',
            });
          }

          couponId = coupon.id;
          discount = coupon.isPercentage
            ? (totalAmount * coupon.discount) / 100
            : coupon.discount;
        }
      }

      // Get user's point balance
      const user = await prisma.user.findUnique({
        where: { id: userId! },
        select: { pointBalance: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Validate points usage
      const validPointsUsed = Math.min(pointsUsed || 0, user.pointBalance, totalAmount - discount);

      // Calculate final amount
      const finalAmount = Math.max(0, totalAmount - discount - validPointsUsed);

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: userId!,
          eventId,
          couponId,
          totalAmount,
          pointsUsed: validPointsUsed,
          finalAmount,
          status: 'WAITING_FOR_PAYMENT',
          paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          tickets: {
            create: transactionTickets,
          },
        },
        include: {
          tickets: {
            include: {
              ticket: true,
            },
          },
        },
      });

      // Deduct points if used
      if (validPointsUsed > 0) {
        await prisma.user.update({
          where: { id: userId! },
          data: {
            pointBalance: { decrement: validPointsUsed },
          },
        });

        // Create point history
        await prisma.pointHistory.create({
          data: {
            userId: userId!,
            points: -validPointsUsed,
            description: `Used points for transaction #${transaction.id}`,
          },
        });
      }

      // Mark coupon as used
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { isUsed: true },
        });
      }

      // Update ticket availability
      for (const ticketData of transactionTickets) {
        await prisma.ticket.update({
          where: { id: ticketData.ticketId },
          data: {
            availableSeats: { decrement: ticketData.quantity },
          },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully. Please upload payment proof.',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { transactionId } = req.params;
      const paymentProofUrl = req.file?.filename;

      if (!paymentProofUrl) {
        return res.status(400).json({
          success: false,
          message: 'Payment proof image is required',
        });
      }

      // Get transaction
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      if (transaction.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to transaction',
        });
      }

      if (transaction.status !== 'WAITING_FOR_PAYMENT') {
        return res.status(400).json({
          success: false,
          message: 'Payment proof can only be uploaded for pending transactions',
        });
      }

      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id: parseInt(transactionId) },
        data: {
          paymentProof: paymentProofUrl,
          status: 'WAITING_FOR_ADMIN_CONFIRMATION',
        },
      });

      res.json({
        success: true,
        message: 'Payment proof uploaded successfully. Waiting for confirmation.',
        data: updatedTransaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment (Organizer only)
   */
  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const { status } = req.body; // 'DONE' or 'REJECTED'

      // Get transaction with full details
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
          user: true,
          event: true,
          tickets: {
            include: {
              ticket: true,
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      // Check if user is the event organizer
      if (transaction.event.organizerId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: 'Only event organizer can confirm payments',
        });
      }

      if (transaction.status !== 'WAITING_FOR_ADMIN_CONFIRMATION') {
        return res.status(400).json({
          success: false,
          message: 'Transaction is not awaiting confirmation',
        });
      }

      if (status === 'DONE') {
        // Update transaction status
        const updatedTransaction = await prisma.transaction.update({
          where: { id: parseInt(transactionId) },
          data: { status: 'DONE' },
        });

        // Create attendees for each ticket
        const attendees = [];
        for (const tt of transaction.tickets) {
          attendees.push({
            userId: transaction.userId,
            eventId: transaction.eventId,
            transactionId: transaction.id,
            ticketType: tt.ticket.name,
            quantity: tt.quantity,
            totalPaid: tt.price * tt.quantity,
          });
        }

        await prisma.attendee.createMany({
          data: attendees,
        });

        // Generate ticket image
        const ticketData = {
          transactionId: transaction.id,
          eventName: transaction.event.name,
          eventDate: transaction.event.startDate.toISOString(),
          eventLocation: transaction.event.location,
          eventAddress: transaction.event.address,
          ticketType: transaction.tickets[0]?.ticket.name || 'General',
          attendeeName: `${transaction.user.firstName} ${transaction.user.lastName}`,
          attendeeEmail: transaction.user.email,
          quantity: transaction.tickets.reduce((sum, t) => sum + t.quantity, 0),
          qrCodeData: ticketGeneratorService.generateQRCodeData(
            transaction.id,
            transaction.user.email
          ),
        };

        const ticketImageBuffer = await ticketGeneratorService.generateTicket(ticketData);

        // Send ticket email with JPG attachment
        await emailService.sendTicketEmail(
          transaction.user.email,
          transaction.user.firstName,
          updatedTransaction,
          transaction.event,
          ticketImageBuffer
        );

        // Send payment confirmation email
        await emailService.sendPaymentConfirmationEmail(
          transaction.user.email,
          transaction.user.firstName,
          transaction.id,
          transaction.event.name
        );

        // Create notification
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: 'TRANSACTION_ACCEPTED',
            title: '✅ Payment Confirmed!',
            message: `Your payment for ${transaction.event.name} has been confirmed. Check your email for tickets.`,
            isRead: false,
          },
        });

        res.json({
          success: true,
          message: 'Payment confirmed successfully. Ticket sent to customer.',
          data: updatedTransaction,
        });
      } else if (status === 'REJECTED') {
        // Update transaction status
        const updatedTransaction = await prisma.transaction.update({
          where: { id: parseInt(transactionId) },
          data: { status: 'REJECTED' },
        });

        // Refund points if used
        if (transaction.pointsUsed > 0) {
          await prisma.user.update({
            where: { id: transaction.userId },
            data: {
              pointBalance: { increment: transaction.pointsUsed },
            },
          });

          await prisma.pointHistory.create({
            data: {
              userId: transaction.userId,
              points: transaction.pointsUsed,
              description: `Refund for rejected transaction #${transaction.id}`,
            },
          });
        }

        // Restore ticket availability
        for (const tt of transaction.tickets) {
          await prisma.ticket.update({
            where: { id: tt.ticketId },
            data: {
              availableSeats: { increment: tt.quantity },
            },
          });
        }

        // Restore coupon if used
        if (transaction.couponId) {
          await prisma.coupon.update({
            where: { id: transaction.couponId },
            data: { isUsed: false },
          });
        }

        // Create notification
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: 'TRANSACTION_REJECTED',
            title: '❌ Payment Rejected',
            message: `Your payment for ${transaction.event.name} was rejected. Please contact support.`,
            isRead: false,
          },
        });

        res.json({
          success: true,
          message: 'Payment rejected. Refund processed.',
          data: updatedTransaction,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      const transactions = await prisma.transaction.findMany({
        where: { userId },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              location: true,
              imageUrl: true,
            },
          },
          tickets: {
            include: {
              ticket: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { transactionId } = req.params;

      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
          event: true,
          tickets: {
            include: {
              ticket: true,
            },
          },
          coupon: true,
          attendees: true,
        },
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      if (transaction.userId !== userId && transaction.event.organizerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to transaction',
        });
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();

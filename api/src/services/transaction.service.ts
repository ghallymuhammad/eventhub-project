import { PrismaClient } from '../generated/prisma';
import { TransactionStatus, TicketType } from '../generated/prisma';

const prisma = new PrismaClient();

export class TransactionService {
  
  /**
   * Create a new ticket purchase transaction with multiple operations
   */
  async createTicketTransaction(data: {
    userId: number;
    eventId: number;
    tickets: Array<{
      ticketId: number;
      quantity: number;
    }>;
    promotionCode?: string;
    pointsToUse?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate user exists
      const user = await tx.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Validate event exists
      const event = await tx.event.findUnique({
        where: { id: data.eventId }
      });

      if (!event) {
        throw new Error('Event not found');
      }

      // 3. Validate and lock ticket availability
      const ticketValidations = await Promise.all(
        data.tickets.map(async (item) => {
          const ticket = await tx.ticket.findUnique({
            where: { id: item.ticketId },
            include: { event: true }
          });

          if (!ticket) {
            throw new Error(`Ticket ${item.ticketId} not found`);
          }

          if (ticket.availableSeats < item.quantity) {
            throw new Error(`Insufficient seats available for ticket ${ticket.name}`);
          }

          if (new Date(ticket.event.startDate) <= new Date()) {
            throw new Error('Cannot purchase tickets for past events');
          }

          return { ticket, quantity: item.quantity };
        })
      );

      // 4. Calculate total amount and apply discounts
      let originalAmount = 0;
      let finalAmount = 0;
      let promotion = null;

      // Calculate base amount
      for (const validation of ticketValidations) {
        originalAmount += validation.ticket.price * validation.quantity;
      }
      finalAmount = originalAmount;

      // Apply promotion code if provided
      if (data.promotionCode) {
        promotion = await tx.promotion.findFirst({
          where: {
            code: data.promotionCode,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            usedCount: { lt: prisma.promotion.fields.maxUses },
            isActive: true
          }
        });

        if (promotion) {
          let discountAmount = 0;
          if (promotion.isPercentage) {
            discountAmount = (finalAmount * promotion.discount) / 100;
          } else {
            discountAmount = promotion.discount;
          }
          finalAmount = Math.max(0, finalAmount - discountAmount);
        }
      }

      // Apply points if provided
      let pointsUsed = 0;
      if (data.pointsToUse && data.pointsToUse > 0) {
        pointsUsed = Math.min(data.pointsToUse, user.pointBalance, finalAmount);
        finalAmount = Math.max(0, finalAmount - pointsUsed);
      }

      // 5. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          eventId: data.eventId,
          totalAmount: originalAmount,
          finalAmount: finalAmount,
          pointsUsed: pointsUsed,
          status: TransactionStatus.WAITING_FOR_PAYMENT,
          promotionId: promotion?.id,
          paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        }
      });

      // 6. Create transaction tickets and update availability
      const transactionTickets = await Promise.all(
        ticketValidations.map(async (validation) => {
          // Create transaction ticket
          const transactionTicket = await tx.transactionTicket.create({
            data: {
              transactionId: transaction.id,
              ticketId: validation.ticket.id,
              quantity: validation.quantity,
              price: validation.ticket.price
            }
          });

          // Update ticket availability
          await tx.ticket.update({
            where: { id: validation.ticket.id },
            data: {
              availableSeats: {
                decrement: validation.quantity
              }
            }
          });

          // Update event availability
          await tx.event.update({
            where: { id: validation.ticket.eventId },
            data: {
              availableSeats: {
                decrement: validation.quantity
              }
            }
          });

          return transactionTicket;
        })
      );

      // 7. Update promotion usage if applied
      if (promotion) {
        await tx.promotion.update({
          where: { id: promotion.id },
          data: {
            usedCount: { increment: 1 }
          }
        });
      }

      // 8. Deduct points if used
      if (pointsUsed > 0) {
        await tx.user.update({
          where: { id: data.userId },
          data: {
            pointBalance: { decrement: pointsUsed }
          }
        });

        // Record point usage history
        await tx.pointHistory.create({
          data: {
            userId: data.userId,
            points: -pointsUsed,
            description: `Points used for transaction #${transaction.id}`
          }
        });
      }

      // Return complete transaction data
      return {
        transaction,
        tickets: transactionTickets,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        promotion,
        ticketDetails: ticketValidations.map(v => v.ticket)
      };
    });
  }

  /**
   * Confirm payment and complete transaction
   */
  async confirmPayment(transactionId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get transaction with all details
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          tickets: {
            include: {
              ticket: {
                include: { event: true }
              }
            }
          },
          promotion: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== TransactionStatus.WAITING_FOR_PAYMENT) {
        throw new Error('Transaction is not waiting for payment');
      }

      // 2. Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.DONE
        }
      });

      // 3. Award points to user (10% of final amount)
      const pointsEarned = Math.floor(transaction.finalAmount * 0.1);
      if (pointsEarned > 0) {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            pointBalance: { increment: pointsEarned }
          }
        });

        await tx.pointHistory.create({
          data: {
            userId: transaction.userId,
            points: pointsEarned,
            description: `Points earned from transaction #${transaction.id}`
          }
        });
      }

      return {
        transaction: updatedTransaction,
        pointsEarned
      };
    });
  }

  /**
   * Cancel transaction and rollback all changes
   */
  async cancelTransaction(transactionId: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get transaction with details
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          tickets: {
            include: { ticket: true }
          },
          promotion: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const cancellableStatuses = [
        TransactionStatus.WAITING_FOR_PAYMENT, 
        TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION
      ];

      if (!cancellableStatuses.includes(transaction.status)) {
        throw new Error('Transaction cannot be cancelled');
      }

      // 2. Restore ticket availability
      for (const transactionTicket of transaction.tickets) {
        await tx.ticket.update({
          where: { id: transactionTicket.ticketId },
          data: {
            availableSeats: { increment: transactionTicket.quantity }
          }
        });

        await tx.event.update({
          where: { id: transactionTicket.ticket.eventId },
          data: {
            availableSeats: { increment: transactionTicket.quantity }
          }
        });
      }

      // 3. Restore promotion usage
      if (transaction.promotionId) {
        await tx.promotion.update({
          where: { id: transaction.promotionId },
          data: {
            usedCount: { decrement: 1 }
          }
        });
      }

      // 4. Restore points if used
      if (transaction.pointsUsed > 0) {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            pointBalance: { increment: transaction.pointsUsed }
          }
        });

        await tx.pointHistory.create({
          data: {
            userId: transaction.userId,
            points: transaction.pointsUsed,
            description: `Points refund for cancelled transaction #${transaction.id}`
          }
        });
      }

      // 5. Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.CANCELED
        }
      });

      return updatedTransaction;
    });
  }

  /**
   * Create event with tickets in a single transaction
   */
  async createEventWithTickets(eventData: any, ticketsData: any[]) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create event
      const event = await tx.event.create({
        data: {
          ...eventData,
          availableSeats: eventData.totalSeats
        }
      });

      // 2. Create tickets
      const tickets = await Promise.all(
        ticketsData.map(ticketData => 
          tx.ticket.create({
            data: {
              ...ticketData,
              eventId: event.id
            }
          })
        )
      );

      return { event, tickets };
    });
  }

  /**
   * Update event and recalculate ticket availability
   */
  async updateEventWithTickets(eventId: number, eventData: any, ticketsData: any[]) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get current event and tickets
      const currentEvent = await tx.event.findUnique({
        where: { id: eventId },
        include: { tickets: true }
      });

      if (!currentEvent) {
        throw new Error('Event not found');
      }

      // 2. Delete old tickets (only if no transactions exist)
      const existingTransactions = await tx.transactionTicket.findFirst({
        where: {
          ticket: {
            eventId: eventId
          }
        }
      });

      if (existingTransactions) {
        throw new Error('Cannot update event with existing transactions');
      }

      await tx.ticket.deleteMany({
        where: { eventId: eventId }
      });

      // 3. Update event
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: eventData
      });

      // 4. Create new tickets
      const newTickets = await Promise.all(
        ticketsData.map(ticketData => 
          tx.ticket.create({
            data: {
              ...ticketData,
              eventId: eventId
            }
          })
        )
      );

      return { event: updatedEvent, tickets: newTickets };
    });
  }
}

export const transactionService = new TransactionService();

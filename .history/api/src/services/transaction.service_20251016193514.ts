import { PrismaClient } from '../generated/prisma';
import { TransactionStatus, TicketType } from '../generated/prisma';

const prisma = new PrismaClient();

export class TransactionService {
  
  /**
   * Create a new ticket purchase transaction with multiple operations
   */
  async createTicketTransaction(data: {
    userId: number;
    tickets: Array<{
      ticketId: number;
      quantity: number;
    }>;
    promotionCode?: string;
    pointsToUse?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate user exists and get their points
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        include: { 
          pointBalances: true,
          referralUsage: true 
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 2. Validate and lock ticket availability
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

      // 3. Calculate total amount and apply discounts
      let totalAmount = 0;
      let discountAmount = 0;
      let promotion = null;

      // Calculate base amount
      for (const validation of ticketValidations) {
        totalAmount += validation.ticket.price * validation.quantity;
      }

      // Apply promotion code if provided
      if (data.promotionCode) {
        promotion = await tx.promotion.findFirst({
          where: {
            code: data.promotionCode,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            currentUses: { lt: tx.promotion.fields.maxUses }
          }
        });

        if (promotion) {
          if (promotion.isPercentage) {
            discountAmount = (totalAmount * promotion.discount) / 100;
          } else {
            discountAmount = promotion.discount;
          }
          discountAmount = Math.min(discountAmount, totalAmount);
        }
      }

      // Apply points if provided
      let pointsUsed = 0;
      if (data.pointsToUse && data.pointsToUse > 0) {
        const userPoints = user.pointBalances.reduce((sum, pb) => sum + pb.amount, 0);
        pointsUsed = Math.min(data.pointsToUse, userPoints, totalAmount - discountAmount);
      }

      const finalAmount = totalAmount - discountAmount - pointsUsed;

      // 4. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          totalAmount: totalAmount,
          finalAmount: finalAmount,
          discountAmount: discountAmount,
          pointsUsed: pointsUsed,
          status: TransactionStatus.WAITING_FOR_PAYMENT,
          promotionId: promotion?.id
        }
      });

      // 5. Create transaction details and update ticket availability
      const transactionDetails = await Promise.all(
        ticketValidations.map(async (validation) => {
          // Create transaction detail
          const detail = await tx.transactionDetail.create({
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

          return detail;
        })
      );

      // 6. Update promotion usage if applied
      if (promotion) {
        await tx.promotion.update({
          where: { id: promotion.id },
          data: {
            currentUses: { increment: 1 }
          }
        });
      }

      // 7. Deduct points if used
      if (pointsUsed > 0) {
        let remainingPointsToUse = pointsUsed;
        
        for (const pointBalance of user.pointBalances) {
          if (remainingPointsToUse <= 0) break;
          
          const deductAmount = Math.min(pointBalance.amount, remainingPointsToUse);
          
          await tx.pointBalance.update({
            where: { id: pointBalance.id },
            data: {
              amount: { decrement: deductAmount }
            }
          });
          
          remainingPointsToUse -= deductAmount;
        }
      }

      // Return complete transaction data
      return {
        transaction,
        details: transactionDetails,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        promotion,
        tickets: ticketValidations.map(v => v.ticket)
      };
    });
  }

  /**
   * Confirm payment and complete transaction
   */
  async confirmPayment(transactionId: number, paymentDetails: any) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get transaction with all details
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          details: {
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
          status: TransactionStatus.DONE,
          paymentDetails: JSON.stringify(paymentDetails)
        }
      });

      // 3. Award points to user (10% of final amount)
      const pointsEarned = Math.floor(transaction.finalAmount * 0.1);
      if (pointsEarned > 0) {
        await tx.pointBalance.create({
          data: {
            userId: transaction.userId,
            amount: pointsEarned,
            source: 'PURCHASE',
            description: `Points earned from transaction #${transaction.id}`
          }
        });
      }

      // 4. Handle referral rewards if applicable
      const referralUsage = await tx.referralUsage.findFirst({
        where: { 
          referredUserId: transaction.userId,
          isUsed: false
        },
        include: { referrer: true }
      });

      if (referralUsage) {
        // Award points to referrer (5% of transaction amount)
        const referrerPoints = Math.floor(transaction.finalAmount * 0.05);
        if (referrerPoints > 0) {
          await tx.pointBalance.create({
            data: {
              userId: referralUsage.referrerId,
              amount: referrerPoints,
              source: 'REFERRAL',
              description: `Referral reward from ${transaction.user.firstName}`
            }
          });
        }

        // Mark referral as used
        await tx.referralUsage.update({
          where: { id: referralUsage.id },
          data: { isUsed: true }
        });
      }

      return {
        transaction: updatedTransaction,
        pointsEarned,
        referralReward: referralUsage ? Math.floor(transaction.finalAmount * 0.05) : 0
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
          details: {
            include: { ticket: true }
          },
          promotion: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (![TransactionStatus.WAITING_FOR_PAYMENT, TransactionStatus.WAITING_FOR_ADMIN_CONFIRMATION].includes(transaction.status)) {
        throw new Error('Transaction cannot be cancelled');
      }

      // 2. Restore ticket availability
      for (const detail of transaction.details) {
        await tx.ticket.update({
          where: { id: detail.ticketId },
          data: {
            availableSeats: { increment: detail.quantity }
          }
        });

        await tx.event.update({
          where: { id: detail.ticket.eventId },
          data: {
            availableSeats: { increment: detail.quantity }
          }
        });
      }

      // 3. Restore promotion usage
      if (transaction.promotion) {
        await tx.promotion.update({
          where: { id: transaction.promotion.id },
          data: {
            currentUses: { decrement: 1 }
          }
        });
      }

      // 4. Restore points if used
      if (transaction.pointsUsed > 0) {
        await tx.pointBalance.create({
          data: {
            userId: transaction.userId,
            amount: transaction.pointsUsed,
            source: 'REFUND',
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

      // 2. Delete old tickets
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

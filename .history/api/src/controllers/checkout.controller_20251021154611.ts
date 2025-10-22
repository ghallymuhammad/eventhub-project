import { Request, Response } from 'express';
import prisma from '../libs/prisma';
import { ResponseBuilder } from '../utils/response.builder';

export class CheckoutController {
  // Create transaction (checkout process)
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { eventId, tickets, promotionCode, couponId, pointsToUse } = req.body;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      // Validate event exists and is active
      const event = await prisma.event.findFirst({
        where: { 
          id: eventId, 
          isActive: true,
          startDate: { gt: new Date() } // Event hasn't started yet
        },
        include: {
          tickets: true
        }
      });

      if (!event) {
        return res.status(404).json(
          ResponseBuilder.error('Event not found or not available', 'EVENT_NOT_FOUND')
        );
      }

      // Validate tickets and calculate total
      let totalAmount = 0;
      const ticketValidations = [];

      for (const ticketItem of tickets) {
        const ticket = event.tickets.find(t => t.id === ticketItem.ticketId);
        if (!ticket) {
          return res.status(400).json(
            ResponseBuilder.error(`Ticket with ID ${ticketItem.ticketId} not found`, 'TICKET_NOT_FOUND')
          );
        }

        if (ticket.availableSeats < ticketItem.quantity) {
          return res.status(400).json(
            ResponseBuilder.error(`Not enough seats available for ${ticket.type}`, 'INSUFFICIENT_SEATS')
          );
        }

        totalAmount += ticket.price * ticketItem.quantity;
        ticketValidations.push({
          ...ticketItem,
          price: ticket.price,
          availableSeats: ticket.availableSeats
        });
      }

      // Get user's current points
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pointBalance: true }
      });

      if (!user) {
        return res.status(404).json(
          ResponseBuilder.error('User not found', 'USER_NOT_FOUND')
        );
      }

      // Validate points usage
      const maxPointsToUse = Math.min(user.pointBalance, Math.floor(totalAmount * 0.5)); // Max 50% of total
      const actualPointsUsed = pointsToUse ? Math.min(pointsToUse, maxPointsToUse) : 0;

      let finalAmount = totalAmount;
      let promotion = null;
      let coupon = null;

      // Apply promotion if provided
      if (promotionCode) {
        promotion = await prisma.promotion.findFirst({
          where: {
            code: promotionCode,
            eventId: eventId,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            usedCount: { lt: prisma.promotion.fields.maxUses }
          }
        });

        if (promotion) {
          const discount = promotion.isPercentage 
            ? Math.floor(totalAmount * promotion.discount / 100)
            : promotion.discount;
          finalAmount -= discount;
        }
      }

      // Apply coupon if provided
      if (couponId) {
        coupon = await prisma.coupon.findFirst({
          where: {
            id: couponId,
            userId: userId,
            isUsed: false,
            expiryDate: { gte: new Date() },
            OR: [
              { eventId: eventId },
              { eventId: null } // System-wide coupon
            ]
          }
        });

        if (coupon) {
          const discount = coupon.isPercentage 
            ? Math.floor(finalAmount * coupon.discount / 100)
            : coupon.discount;
          finalAmount -= discount;
        }
      }

      // Apply points discount
      finalAmount -= actualPointsUsed;
      finalAmount = Math.max(0, finalAmount); // Can't be negative

      // Set payment deadline (24 hours from now)
      const paymentDeadline = new Date();
      paymentDeadline.setHours(paymentDeadline.getHours() + 24);

      // Create transaction with all related data
      const transaction = await prisma.$transaction(async (tx) => {
        // 1. Create the transaction
        const newTransaction = await tx.transaction.create({
          data: {
            userId,
            eventId,
            promotionId: promotion?.id,
            couponId: coupon?.id,
            totalAmount,
            pointsUsed: actualPointsUsed,
            finalAmount,
            status: finalAmount === 0 ? 'DONE' : 'WAITING_FOR_PAYMENT',
            paymentDeadline
          }
        });

        // 2. Create transaction tickets
        for (const ticketItem of ticketValidations) {
          await tx.transactionTicket.create({
            data: {
              transactionId: newTransaction.id,
              ticketId: ticketItem.ticketId,
              quantity: ticketItem.quantity,
              price: ticketItem.price
            }
          });

          // 3. Update ticket availability
          await tx.ticket.update({
            where: { id: ticketItem.ticketId },
            data: {
              availableSeats: { decrement: ticketItem.quantity }
            }
          });
        }

        // 4. Update user points if used
        if (actualPointsUsed > 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              pointBalance: { decrement: actualPointsUsed }
            }
          });

          // 5. Create point history record
          await tx.pointHistory.create({
            data: {
              userId,
              points: -actualPointsUsed,
              description: `Used points for event: ${event.name}`
            }
          });
        }

        // 6. Mark coupon as used
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { isUsed: true }
          });
        }

        // 7. Update promotion usage
        if (promotion) {
          await tx.promotion.update({
            where: { id: promotion.id },
            data: { usedCount: { increment: 1 } }
          });
        }

        // 8. If transaction is free (finalAmount = 0), create attendee records
        if (finalAmount === 0) {
          for (const ticketItem of ticketValidations) {
            for (let i = 0; i < ticketItem.quantity; i++) {
              await tx.attendee.create({
                data: {
                  userId,
                  eventId,
                  transactionId: newTransaction.id,
                  ticketType: ticketItem.price.toString(), // Store ticket type info
                  status: 'CONFIRMED'
                }
              });
            }
          }

          // Award points for attending (10% of original amount)
          const pointsEarned = Math.floor(totalAmount * 0.1);
          if (pointsEarned > 0) {
            await tx.user.update({
              where: { id: userId },
              data: {
                pointBalance: { increment: pointsEarned }
              }
            });

            await tx.pointHistory.create({
              data: {
                userId,
                points: pointsEarned,
                description: `Points earned from event: ${event.name}`
              }
            });
          }
        }

        return newTransaction;
      });

      // Fetch complete transaction data
      const completeTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              location: true,
              imageUrl: true
            }
          },
          tickets: {
            include: {
              ticket: {
                select: {
                  id: true,
                  type: true,
                  description: true
                }
              }
            }
          },
          promotion: true,
          coupon: true
        }
      });

      return res.status(201).json(
        ResponseBuilder.success(completeTransaction, 'Transaction created successfully')
      );

    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Update payment proof
  async uploadPaymentProof(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { transactionId } = req.params;
      const { paymentProof } = req.body;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      const transaction = await prisma.transaction.findFirst({
        where: {
          id: parseInt(transactionId),
          userId,
          status: 'WAITING_FOR_PAYMENT'
        }
      });

      if (!transaction) {
        return res.status(404).json(
          ResponseBuilder.error('Transaction not found or not eligible for payment', 'TRANSACTION_NOT_FOUND')
        );
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          paymentProof,
          status: 'WAITING_FOR_ADMIN_CONFIRMATION'
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              location: true
            }
          }
        }
      });

      return res.json(
        ResponseBuilder.success(updatedTransaction, 'Payment proof uploaded successfully')
      );

    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }

  // Calculate checkout preview (before creating transaction)
  async getCheckoutPreview(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { eventId, tickets, promotionCode, couponId, pointsToUse } = req.body;

      if (!userId) {
        return res.status(401).json(
          ResponseBuilder.error('Unauthorized', 'USER_NOT_AUTHENTICATED')
        );
      }

      // Get event and tickets
      const event = await prisma.event.findFirst({
        where: { id: eventId, isActive: true },
        include: { tickets: true }
      });

      if (!event) {
        return res.status(404).json(
          ResponseBuilder.error('Event not found', 'EVENT_NOT_FOUND')
        );
      }

      // Calculate total
      let totalAmount = 0;
      const ticketDetails = [];

      for (const ticketItem of tickets) {
        const ticket = event.tickets.find(t => t.id === ticketItem.ticketId);
        if (ticket) {
          const subtotal = ticket.price * ticketItem.quantity;
          totalAmount += subtotal;
          ticketDetails.push({
            ...ticketItem,
            ticketType: ticket.type,
            price: ticket.price,
            subtotal,
            available: ticket.availableSeats >= ticketItem.quantity
          });
        }
      }

      // Get user points
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pointBalance: true }
      });

      const maxPointsToUse = Math.min(user?.pointBalance || 0, Math.floor(totalAmount * 0.5));
      const actualPointsUsed = pointsToUse ? Math.min(pointsToUse, maxPointsToUse) : 0;

      let finalAmount = totalAmount;
      let discounts = [];

      // Check promotion
      let promotion = null;
      if (promotionCode) {
        promotion = await prisma.promotion.findFirst({
          where: {
            code: promotionCode,
            eventId: eventId,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            usedCount: { lt: prisma.promotion.fields.maxUses }
          }
        });

        if (promotion) {
          const discount = promotion.isPercentage 
            ? Math.floor(totalAmount * promotion.discount / 100)
            : promotion.discount;
          finalAmount -= discount;
          discounts.push({
            type: 'promotion',
            name: promotion.name,
            amount: discount
          });
        }
      }

      // Check coupon
      let coupon = null;
      if (couponId) {
        coupon = await prisma.coupon.findFirst({
          where: {
            id: couponId,
            userId: userId,
            isUsed: false,
            expiryDate: { gte: new Date() },
            OR: [
              { eventId: eventId },
              { eventId: null }
            ]
          }
        });

        if (coupon) {
          const discount = coupon.isPercentage 
            ? Math.floor(finalAmount * coupon.discount / 100)
            : coupon.discount;
          finalAmount -= discount;
          discounts.push({
            type: 'coupon',
            name: coupon.name,
            amount: discount
          });
        }
      }

      // Apply points
      if (actualPointsUsed > 0) {
        finalAmount -= actualPointsUsed;
        discounts.push({
          type: 'points',
          name: 'Points Used',
          amount: actualPointsUsed
        });
      }

      finalAmount = Math.max(0, finalAmount);

      const preview = {
        event: {
          id: event.id,
          name: event.name,
          startDate: event.startDate,
          location: event.location
        },
        ticketDetails,
        pricing: {
          totalAmount,
          discounts,
          pointsUsed: actualPointsUsed,
          maxPointsAvailable: maxPointsToUse,
          finalAmount
        },
        validPromotionApplied: !!promotion,
        validCouponApplied: !!coupon,
        allTicketsAvailable: ticketDetails.every(t => t.available)
      };

      return res.json(
        ResponseBuilder.success(preview, 'Checkout preview calculated successfully')
      );

    } catch (error) {
      console.error('Error calculating checkout preview:', error);
      return res.status(500).json(
        ResponseBuilder.error('Internal server error', 'INTERNAL_ERROR')
      );
    }
  }
}

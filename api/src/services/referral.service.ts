import { PrismaClient } from '../generated/prisma';
import { 
  generateReferralCode, 
  generateCouponCode, 
  calculatePointsExpiryDate, 
  calculateCouponExpiryDate,
  REFERRAL_CONSTANTS 
} from '../utils/referral.utils';

const prisma = new PrismaClient();

export class ReferralService {
  /**
   * Process referral rewards when a new user registers
   */
  static async processReferralReward(newUserId: number, referralCode?: string) {
    if (!referralCode) return null;

    try {
      // Find the referrer
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        throw new Error('Invalid referral code');
      }

      // Don't allow self-referral
      if (referrer.id === newUserId) {
        throw new Error('Cannot use your own referral code');
      }

      // Award points to referrer
      await this.awardPoints(
        referrer.id,
        REFERRAL_CONSTANTS.POINTS_REWARD,
        `Referral reward for inviting new user`
      );

      // Create referral discount coupon for new user
      const couponCode = generateCouponCode('WELCOME');
      await prisma.coupon.create({
        data: {
          userId: newUserId,
          code: couponCode,
          type: 'REFERRAL',
          name: 'Welcome Referral Discount',
          description: `${REFERRAL_CONSTANTS.REFERRAL_DISCOUNT_PERCENTAGE}% discount for joining through referral`,
          discount: REFERRAL_CONSTANTS.REFERRAL_DISCOUNT_PERCENTAGE,
          isPercentage: true,
          expiryDate: calculateCouponExpiryDate(),
        },
      });

      // Create notification for referrer
      await prisma.notification.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL_REWARD',
          title: 'Referral Reward Earned!',
          message: `You earned ${REFERRAL_CONSTANTS.POINTS_REWARD} points for referring a new user!`,
          metadata: JSON.stringify({ 
            pointsEarned: REFERRAL_CONSTANTS.POINTS_REWARD,
            newUserId 
          }),
        },
      });

      return {
        referrer: {
          id: referrer.id,
          name: `${referrer.firstName} ${referrer.lastName}`,
          pointsEarned: REFERRAL_CONSTANTS.POINTS_REWARD,
        },
        newUserCoupon: {
          code: couponCode,
          discount: REFERRAL_CONSTANTS.REFERRAL_DISCOUNT_PERCENTAGE,
        },
      };
    } catch (error) {
      console.error('Error processing referral reward:', error);
      throw error;
    }
  }

  /**
   * Award points to a user
   */
  static async awardPoints(userId: number, points: number, description: string) {
    try {
      // Update user's point balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          pointBalance: {
            increment: points,
          },
        },
      });

      // Record point history
      await prisma.pointHistory.create({
        data: {
          userId,
          points,
          description,
        },
      });

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Deduct points from a user
   */
  static async deductPoints(userId: number, points: number, description: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.pointBalance < points) {
        throw new Error('Insufficient points');
      }

      // Update user's point balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          pointBalance: {
            decrement: points,
          },
        },
      });

      // Record point history
      await prisma.pointHistory.create({
        data: {
          userId,
          points: -points,
          description,
        },
      });

      return true;
    } catch (error) {
      console.error('Error deducting points:', error);
      throw error;
    }
  }

  /**
   * Get user's referral statistics
   */
  static async getReferralStats(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Count total referrals
      const totalReferrals = await prisma.user.count({
        where: { referredBy: user.referralCode },
      });

      // Calculate total points earned from referrals
      const referralPointHistory = await prisma.pointHistory.findMany({
        where: {
          userId,
          description: {
            contains: 'Referral reward',
          },
        },
      });

      const totalPointsEarned = referralPointHistory.reduce(
        (sum, record) => sum + record.points,
        0
      );

      // Get referral history
      const referredUsers = await prisma.user.findMany({
        where: { referredBy: user.referralCode },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      const referralHistory = referredUsers.map(refUser => ({
        referredUser: `${refUser.firstName} ${refUser.lastName}`,
        email: refUser.email,
        dateReferred: refUser.createdAt.toISOString(),
        pointsEarned: REFERRAL_CONSTANTS.POINTS_REWARD,
        status: 'completed',
      }));

      return {
        referralCode: user.referralCode,
        totalReferrals,
        totalPointsEarned,
        referralHistory,
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  /**
   * Get user's available coupons
   */
  static async getUserCoupons(userId: number) {
    try {
      const coupons = await prisma.coupon.findMany({
        where: {
          userId,
          isUsed: false,
          expiryDate: {
            gt: new Date(),
          },
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return coupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discount: coupon.discount,
        isPercentage: coupon.isPercentage,
        type: coupon.type,
        expiryDate: coupon.expiryDate,
        event: coupon.event,
      }));
    } catch (error) {
      console.error('Error getting user coupons:', error);
      throw error;
    }
  }

  /**
   * Validate and use a coupon
   */
  static async useCoupon(couponCode: string, userId: number, eventId?: number) {
    try {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          userId,
          isUsed: false,
          expiryDate: {
            gt: new Date(),
          },
        },
      });

      if (!coupon) {
        throw new Error('Invalid or expired coupon');
      }

      // Check if coupon is event-specific
      if (coupon.eventId && coupon.eventId !== eventId) {
        throw new Error('This coupon is not valid for this event');
      }

      return coupon;
    } catch (error) {
      console.error('Error using coupon:', error);
      throw error;
    }
  }

  /**
   * Mark coupon as used
   */
  static async markCouponAsUsed(couponId: number) {
    try {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { isUsed: true },
      });
    } catch (error) {
      console.error('Error marking coupon as used:', error);
      throw error;
    }
  }

  /**
   * Restore coupon (mark as unused) - for transaction cancellations
   */
  static async restoreCoupon(couponId: number) {
    try {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { isUsed: false },
      });
    } catch (error) {
      console.error('Error restoring coupon:', error);
      throw error;
    }
  }
}

export default ReferralService;

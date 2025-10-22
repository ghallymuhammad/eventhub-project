import { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';
import { hashPassword } from '../libs/bcrypt';

class UserController {
  /**
   * Get user profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          pointBalance: true,
          avatar: true,
          isVerified: true,
          referralCode: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, phoneNumber } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
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
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          avatar: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload user avatar
   */
  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // For now, we'll just return a placeholder URL
      // In production, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl }
      });

      res.json({
        success: true,
        data: { avatarUrl },
        message: 'Avatar updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get referral statistics
   */
  getReferralStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true }
      });

      // Count referred users
      const referredCount = await prisma.user.count({
        where: { referredBy: user?.referralCode }
      });

      // Get point history for referral rewards
      const referralRewards = await prisma.pointHistory.findMany({
        where: {
          userId,
          description: { contains: 'referral' }
        }
      });

      const totalReferralPoints = referralRewards.reduce((sum, reward) => sum + reward.points, 0);

      res.json({
        success: true,
        data: {
          referralCode: user?.referralCode,
          referredCount,
          totalReferralPoints,
          referralHistory: referralRewards
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get point history
   */
  getPointHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const pointHistory = await prisma.pointHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: pointHistory
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user coupons
   */
  getCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const coupons = await prisma.coupon.findMany({
        where: { 
          userId,
          isUsed: false,
          expiryDate: { gte: new Date() }
        },
        include: {
          event: {
            select: { name: true, startDate: true }
          }
        }
      });

      res.json({
        success: true,
        data: coupons
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();

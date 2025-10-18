import { Request, Response, NextFunction } from 'express';
import prisma from '../libs/prisma';
import { hashPassword, comparePassword } from '../libs/bcrypt';
import { generateJWT, verifyJWT } from '../libs/jwt';
import emailService from '../services/email.service';
import { randomBytes } from 'crypto';

export class AuthController {
  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, phoneNumber, referralCode } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate unique referral code for new user
      const userReferralCode = randomBytes(4).toString('hex').toUpperCase();

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber,
          referralCode: userReferralCode,
          referredBy: referralCode || null,
        },
      });

      // If user was referred, give both users rewards
      if (referralCode) {
        await this.handleReferralRewards(referralCode, user.id);
      }

      // Generate email verification token
      const verificationToken = generateJWT({ userId: user.id, email: user.email });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

      // Generate auth token
      const token = generateJWT({ id: user.id, email: user.email, role: user.role });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
            referralCode: user.referralCode,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle referral rewards
   */
  private async handleReferralRewards(referralCode: string, newUserId: number) {
    try {
      // Find the referrer
      const referrer = await prisma.user.findFirst({
        where: { referralCode },
      });

      if (!referrer) return;

      // Give referrer 10,000 points
      await prisma.user.update({
        where: { id: referrer.id },
        data: { pointBalance: { increment: 10000 } },
      });

      // Create point history for referrer
      await prisma.pointHistory.create({
        data: {
          userId: referrer.id,
          points: 10000,
          description: 'Referral reward',
        },
      });

      // Give new user a 10% discount coupon
      await prisma.coupon.create({
        data: {
          userId: newUserId,
          code: `WELCOME-${randomBytes(4).toString('hex').toUpperCase()}`,
          type: 'REFERRAL',
          name: 'Welcome Discount',
          description: 'Welcome gift for joining through referral',
          discount: 10,
          isPercentage: true,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      });

      // Create notifications for both users
      await prisma.notification.createMany({
        data: [
          {
            userId: referrer.id,
            type: 'REFERRAL_REWARD',
            title: 'Referral Reward Earned! 🎉',
            message: `You earned 10,000 points for referring a friend!`,
            isRead: false,
          },
          {
            userId: newUserId,
            type: 'REFERRAL_REWARD',
            title: 'Welcome Gift! 🎁',
            message: `You received a 10% discount coupon for joining through a referral!`,
            isRead: false,
          },
        ],
      });
    } catch (error) {
      console.error('Error handling referral rewards:', error);
    }
  }

  /**
   * Verify email
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      // Verify token
      const decoded = verifyJWT(token) as { userId: number; email: string };

      // Update user verification status
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { isVerified: true },
      });

      res.json({
        success: true,
        message: 'Email verified successfully!',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }
  }

  /**
   * Login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = generateJWT({ id: user.id, email: user.email, role: user.role });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
            pointBalance: user.pointBalance,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        });
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetExpiry,
        },
      });

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetExpiry: null,
        },
      });

      res.json({
        success: true,
        message: 'Password reset successfully! You can now login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

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
          referredBy: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

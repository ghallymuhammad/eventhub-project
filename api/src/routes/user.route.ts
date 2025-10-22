import { Router } from 'express';
import userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', verifyToken, userController.updateProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/avatar', verifyToken, userController.uploadAvatar);

/**
 * @route   GET /api/users/referral-stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get('/referral-stats', verifyToken, userController.getReferralStats);

/**
 * @route   GET /api/users/point-history
 * @desc    Get point history
 * @access  Private
 */
router.get('/point-history', verifyToken, userController.getPointHistory);

/**
 * @route   GET /api/users/coupons
 * @desc    Get user coupons
 * @access  Private
 */
router.get('/coupons', verifyToken, userController.getCoupons);

export default router;

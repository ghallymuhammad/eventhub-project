import { Router } from 'express';
import { UserDashboardController } from '../controllers/user-dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userDashboardController = new UserDashboardController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard routes
router.get('/dashboard', userDashboardController.getDashboard);
router.get('/tickets', userDashboardController.getPurchasedTickets);
router.get('/points', userDashboardController.getPointHistory);
router.get('/coupons', userDashboardController.getCoupons);
router.put('/profile', userDashboardController.updateProfile);

export default router;

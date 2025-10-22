import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
const checkoutController = new CheckoutController();

// Apply auth middleware to all routes
router.use(verifyToken);

// Checkout routes
router.post('/preview', checkoutController.getCheckoutPreview);
router.post('/create', checkoutController.createTransaction);
router.put('/:transactionId/payment', checkoutController.uploadPaymentProof);

export default router;

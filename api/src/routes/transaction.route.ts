import { Router } from 'express';
import transactionController from '../controllers/transaction.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploader } from '../middlewares/express/uploader';

const router = Router();

// Create multer upload instance for payment proofs
const upload = uploader('payment', '/payments');

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post('/', verifyToken, transactionController.createTransaction);

/**
 * @route   POST /api/transactions/:transactionId/payment-proof
 * @desc    Upload payment proof
 * @access  Private
 */
router.post(
  '/:transactionId/payment-proof',
  verifyToken,
  upload.single('paymentProof'),
  transactionController.uploadPaymentProof
);

/**
 * @route   PATCH /api/transactions/:transactionId/confirm
 * @desc    Confirm or reject payment (Organizer only)
 * @access  Private (Organizer)
 */
router.patch('/:transactionId/confirm', verifyToken, transactionController.confirmPayment);

/**
 * @route   GET /api/transactions
 * @desc    Get user transactions
 * @access  Private
 */
router.get('/', verifyToken, transactionController.getUserTransactions);

/**
 * @route   GET /api/transactions/:transactionId
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:transactionId', verifyToken, transactionController.getTransactionById);

export default router;

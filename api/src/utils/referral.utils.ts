import { randomBytes } from 'crypto';

/**
 * Generate a unique referral code for a user
 * Format: EVTHUB + 6 random characters (uppercase letters and numbers)
 */
export function generateReferralCode(): string {
  const randomChars = randomBytes(3).toString('hex').toUpperCase();
  return `EVTHUB${randomChars}`;
}

/**
 * Generate a unique coupon code
 * Format: Prefix + timestamp + random characters
 */
export function generateCouponCode(prefix: string = 'COUPON'): string {
  const timestamp = Date.now().toString().slice(-6);
  const randomChars = randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${randomChars}`;
}

/**
 * Calculate points expiry date (3 months from now)
 */
export function calculatePointsExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  return expiryDate;
}

/**
 * Calculate coupon expiry date (3 months from now)
 */
export function calculateCouponExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  return expiryDate;
}

/**
 * Calculate payment deadline (2 hours from now)
 */
export function calculatePaymentDeadline(): Date {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 2);
  return deadline;
}

/**
 * Calculate admin confirmation deadline (3 days from now)
 */
export function calculateAdminConfirmationDeadline(): Date {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 3);
  return deadline;
}

/**
 * Format Indonesian Rupiah currency
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  originalAmount: number,
  discount: number,
  isPercentage: boolean
): number {
  if (isPercentage) {
    return Math.floor((originalAmount * discount) / 100);
  }
  return Math.min(discount, originalAmount);
}

/**
 * Calculate final transaction amount after all discounts and points
 */
export function calculateFinalAmount(
  originalAmount: number,
  promotionDiscount: number = 0,
  couponDiscount: number = 0,
  pointsUsed: number = 0
): number {
  let finalAmount = originalAmount - promotionDiscount - couponDiscount - pointsUsed;
  return Math.max(0, finalAmount);
}

/**
 * Check if points are expired
 */
export function arePointsExpired(createdAt: Date): boolean {
  const expiryDate = new Date(createdAt);
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  return new Date() > expiryDate;
}

/**
 * Check if coupon is expired
 */
export function isCouponExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

/**
 * Generate transaction reference number
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString();
  const randomChars = randomBytes(2).toString('hex').toUpperCase();
  return `TXN${timestamp}${randomChars}`;
}

/**
 * Validate Indonesian phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Generate secure password reset token
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Constants for the referral system
 */
export const REFERRAL_CONSTANTS = {
  POINTS_REWARD: 10000, // Points given to referrer
  REFERRAL_DISCOUNT_PERCENTAGE: 10, // 10% discount for new user
  POINTS_EXPIRY_MONTHS: 3,
  COUPON_EXPIRY_MONTHS: 3,
  PAYMENT_TIMEOUT_HOURS: 2,
  ADMIN_CONFIRMATION_TIMEOUT_DAYS: 3,
} as const;

/**
 * Email templates
 */
export const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to EventHub!',
    template: 'welcome',
  },
  REFERRAL_REWARD: {
    subject: 'You earned referral rewards!',
    template: 'referral-reward',
  },
  TRANSACTION_ACCEPTED: {
    subject: 'Your transaction has been accepted',
    template: 'transaction-accepted',
  },
  TRANSACTION_REJECTED: {
    subject: 'Your transaction has been rejected',
    template: 'transaction-rejected',
  },
  PAYMENT_REMINDER: {
    subject: 'Payment reminder - Complete your transaction',
    template: 'payment-reminder',
  },
  PASSWORD_RESET: {
    subject: 'Reset your password',
    template: 'password-reset',
  },
} as const;

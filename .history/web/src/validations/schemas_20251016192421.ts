import * as Yup from 'yup';

// Authentication Validation Schemas
export const registerValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  
  phoneNumber: Yup.string()
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Invalid Indonesian phone number format')
    .optional(),
  
  role: Yup.string()
    .oneOf(['USER', 'ORGANIZER'], 'Invalid role')
    .required('Role is required'),
  
  referralCode: Yup.string()
    .matches(/^EVTHUB[A-Z0-9]{6}$/, 'Invalid referral code format')
    .optional(),
});

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  password: Yup.string()
    .required('Password is required'),
});

export const resetPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

export const changePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Profile Validation Schema
export const profileValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  
  phoneNumber: Yup.string()
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Invalid Indonesian phone number format')
    .optional(),
});

// Event Validation Schema
export const eventValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Event name must be at least 3 characters')
    .max(200, 'Event name must be less than 200 characters')
    .required('Event name is required'),
  
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .required('Description is required'),
  
  category: Yup.string()
    .oneOf(['MUSIC', 'TECHNOLOGY', 'BUSINESS', 'SPORTS', 'ARTS', 'FOOD', 'EDUCATION', 'HEALTH', 'OTHER'])
    .required('Category is required'),
  
  location: Yup.string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location must be less than 100 characters')
    .required('Location is required'),
  
  address: Yup.string()
    .min(10, 'Address must be at least 10 characters')
    .max(300, 'Address must be less than 300 characters')
    .required('Address is required'),
  
  startDate: Yup.date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  
  price: Yup.number()
    .min(0, 'Price must be positive')
    .max(100000000, 'Price is too high') // 100 million IDR max
    .when('isFree', {
      is: false,
      then: (schema) => schema.min(1000, 'Price must be at least IDR 1,000'),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  totalSeats: Yup.number()
    .min(1, 'Must have at least 1 seat')
    .max(100000, 'Maximum 100,000 seats allowed')
    .required('Total seats is required'),
  
  availableSeats: Yup.number()
    .min(1, 'Must have at least 1 available seat')
    .max(Yup.ref('totalSeats'), 'Available seats cannot exceed total seats')
    .required('Available seats is required'),
  
  isFree: Yup.boolean()
    .required('Please specify if the event is free'),
});

// Ticket Validation Schema
export const ticketValidationSchema = Yup.object({
  type: Yup.string()
    .oneOf(['REGULAR', 'VIP', 'EARLY_BIRD', 'STUDENT'])
    .required('Ticket type is required'),
  
  name: Yup.string()
    .min(3, 'Ticket name must be at least 3 characters')
    .max(100, 'Ticket name must be less than 100 characters')
    .required('Ticket name is required'),
  
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  price: Yup.number()
    .min(0, 'Price must be positive')
    .max(50000000, 'Price is too high') // 50 million IDR max
    .required('Price is required'),
  
  availableSeats: Yup.number()
    .min(1, 'Must have at least 1 available seat')
    .required('Available seats is required'),
});

// Transaction Validation Schema
export const transactionValidationSchema = Yup.object({
  tickets: Yup.array()
    .of(
      Yup.object({
        ticketId: Yup.number().required('Ticket ID is required'),
        quantity: Yup.number()
          .min(1, 'Quantity must be at least 1')
          .max(10, 'Maximum 10 tickets per transaction')
          .required('Quantity is required'),
      })
    )
    .min(1, 'At least one ticket must be selected')
    .required('Tickets are required'),
  
  promotionCode: Yup.string()
    .matches(/^[A-Z0-9]{6,20}$/, 'Invalid promotion code format')
    .optional(),
  
  couponCode: Yup.string()
    .matches(/^[A-Z0-9]{6,20}$/, 'Invalid coupon code format')
    .optional(),
  
  pointsToUse: Yup.number()
    .min(0, 'Points to use must be positive')
    .optional(),
});

// Promotion Validation Schema
export const promotionValidationSchema = Yup.object({
  code: Yup.string()
    .matches(/^[A-Z0-9]{6,20}$/, 'Promotion code must be 6-20 characters, letters and numbers only')
    .required('Promotion code is required'),
  
  name: Yup.string()
    .min(3, 'Promotion name must be at least 3 characters')
    .max(100, 'Promotion name must be less than 100 characters')
    .required('Promotion name is required'),
  
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  discount: Yup.number()
    .min(1, 'Discount must be at least 1')
    .when('isPercentage', {
      is: true,
      then: (schema) => schema.max(100, 'Percentage discount cannot exceed 100%'),
      otherwise: (schema) => schema.max(10000000, 'Discount amount is too high'),
    })
    .required('Discount is required'),
  
  isPercentage: Yup.boolean()
    .required('Discount type is required'),
  
  maxUses: Yup.number()
    .min(1, 'Max uses must be at least 1')
    .max(10000, 'Max uses cannot exceed 10,000')
    .required('Max uses is required'),
  
  startDate: Yup.date()
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
});

// Review Validation Schema
export const reviewValidationSchema = Yup.object({
  rating: Yup.number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .required('Rating is required'),
  
  comment: Yup.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
});

// Search and Filter Validation Schema
export const eventFilterValidationSchema = Yup.object({
  search: Yup.string()
    .max(100, 'Search term must be less than 100 characters')
    .optional(),
  
  category: Yup.string()
    .oneOf(['', 'MUSIC', 'TECHNOLOGY', 'BUSINESS', 'SPORTS', 'ARTS', 'FOOD', 'EDUCATION', 'HEALTH', 'OTHER'])
    .optional(),
  
  location: Yup.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  priceMin: Yup.number()
    .min(0, 'Minimum price must be positive')
    .optional(),
  
  priceMax: Yup.number()
    .min(Yup.ref('priceMin'), 'Maximum price must be greater than minimum price')
    .optional(),
  
  startDate: Yup.date()
    .optional(),
  
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .optional(),
  
  isFree: Yup.boolean()
    .optional(),
});

// Checkout Form Validation Schema
export const checkoutValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  phoneNumber: Yup.string()
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Invalid Indonesian phone number format')
    .required('Phone number is required'),
});

// Contact Form Validation Schema
export const contactFormValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .required('Subject is required'),
  
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

// Email Test Validation Schema
export const emailTestValidationSchema = Yup.object({
  to: Yup.string()
    .email('Invalid email format')
    .required('Recipient email is required'),
  
  subject: Yup.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters')
    .required('Subject is required'),
  
  message: Yup.string()
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

// Event Detail Page Specific Validations

// Contact Organizer Validation Schema
export const contactOrganizerValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .required('Subject is required'),
  
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

// Share Event Validation Schema
export const shareEventValidationSchema = Yup.object({
  recipientEmails: Yup.array()
    .of(
      Yup.string()
        .email('Invalid email format')
        .required('Email is required')
    )
    .min(1, 'At least one email is required')
    .max(10, 'Maximum 10 recipients allowed')
    .required('Recipient emails are required'),
  
  personalMessage: Yup.string()
    .max(500, 'Personal message must be less than 500 characters')
    .default(''),
  
  senderName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Your name is required'),
});

// Event Favorite Validation Schema (for adding notes when favoriting)
export const eventFavoriteValidationSchema = Yup.object({
  notes: Yup.string()
    .max(300, 'Notes must be less than 300 characters')
    .default(''),
  
  reminderDate: Yup.date()
    .min(new Date(), 'Reminder date must be in the future')
    .nullable()
    .default(null),
  
  categories: Yup.array()
    .of(Yup.string().required())
    .max(5, 'Maximum 5 categories allowed')
    .default([]),
});

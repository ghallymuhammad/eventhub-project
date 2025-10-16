"use client";

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { toast } from 'sonner';
import { registerValidationSchema } from '@/validations/schemas';
import { 
  FormField, 
  FormSelect, 
  FormCheckbox, 
  FormButton, 
  FormGroup 
} from './FormComponents';
import { api } from '@/libs/api';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: 'USER' | 'ORGANIZER';
  referralCode: string;
  agreeToTerms: boolean;
}

interface RegisterFormProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: RegisterFormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'USER',
    referralCode: '',
    agreeToTerms: false,
  };

  const roleOptions = [
    { value: 'USER', label: 'Customer - I want to attend events' },
    { value: 'ORGANIZER', label: 'Event Organizer - I want to create events' },
  ];

  const handleSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Remove confirmPassword and agreeToTerms before sending to API
      const { confirmPassword, agreeToTerms, ...submitData } = values;
      
      if (!agreeToTerms) {
        toast.error('Please agree to the terms and conditions');
        return;
      }

      // Call API to register user
      const response = await api.users.register({
        ...submitData,
        phoneNumber: submitData.phoneNumber || undefined,
        referralCode: submitData.referralCode || undefined,
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Join EventHub
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create your account to discover amazing events
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={registerValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
            {/* Personal Information */}
            <FormGroup
              title="Personal Information"
              description="Tell us about yourself"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  required
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  required
                />
              </div>
              
              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                required
              />
              
              <FormField
                name="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="e.g., +62812345678 or 0812345678"
              />
            </FormGroup>

            {/* Account Information */}
            <FormGroup
              title="Account Information"
              description="Set up your account credentials"
            >
              <FormSelect
                name="role"
                label="Account Type"
                options={roleOptions}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                />
                <FormField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </FormGroup>

            {/* Referral Code */}
            <FormGroup
              title="Referral Code (Optional)"
              description="Have a referral code? Enter it here to get a welcome discount!"
            >
              <FormField
                name="referralCode"
                label="Referral Code"
                placeholder="e.g., EVTHUBABCD12"
              />
              
              {values.referralCode && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    🎉 Great! You&apos;ll receive a 10% discount coupon after registration.
                  </p>
                </div>
              )}
            </FormGroup>

            {/* Terms and Conditions */}
            <FormGroup>
              <FormCheckbox
                name="agreeToTerms"
                label="I agree to the Terms of Service and Privacy Policy"
              />
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <FormButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </FormButton>
                
                <FormButton
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                  className="flex-1 sm:flex-initial"
                >
                  Already have an account? Sign In
                </FormButton>
              </div>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </div>
  );
};

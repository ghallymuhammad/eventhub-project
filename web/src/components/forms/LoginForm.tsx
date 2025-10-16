"use client";

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { toast } from 'sonner';
import { loginValidationSchema } from '@/validations/schemas';
import { FormField, FormButton, FormGroup } from './FormComponents';
import { api } from '@/libs/api';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: LoginFormData = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await api.auth.login({
        email: values.email,
        password: values.password,
      });

      toast.success('Login successful! Welcome back.');
      
      // Store authentication data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token);
        if (values.rememberMe) {
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to your EventHub account
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <FormGroup>
              <FormField
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
              />
              
              <FormField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                required
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <FormButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading || isSubmitting}
                  disabled={isLoading || isSubmitting}
                  className="w-full"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </FormButton>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                  </span>
                  <a
                    href="/register"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up here
                  </a>
                </div>
              </div>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </div>
  );
};

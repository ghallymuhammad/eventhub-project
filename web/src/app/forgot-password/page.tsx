'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'sonner';
import { Mail, ArrowRight, ArrowLeft, Sparkles, Heart, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import * as Yup from 'yup';
import { api } from '@/libs/api';

interface ForgotPasswordFormData {
  email: string;
}

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const initialValues: ForgotPasswordFormData = {
    email: '',
  };

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      await api.auth.resetPassword({
        email: values.email,
      });

      toast.success('Password reset link sent! Check your email.');
      setEmailSent(true);
      
      // Start cooldown timer (60 seconds)
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (cooldown === 0) {
      // Reset the form to trigger submission
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (emailInput && emailInput.value) {
        handleSubmit({ email: emailInput.value });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4 pt-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/login"
          className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          {!emailSent ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-300">No worries! Enter your email and we&apos;ll send you a reset link.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Check Your Email!</h1>
              <p className="text-gray-300">We&apos;ve sent a password reset link to your email address.</p>
            </>
          )}
        </div>

        {/* Form */}
        <div className="glassmorphism rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          {!emailSent ? (
            <Formik
              initialValues={initialValues}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* Email Field */}
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-2 text-sm text-red-400" />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Reset Link...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Send Reset Link
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Email Sent Successfully!</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We&apos;ve sent a password reset link to your email address. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
                
                {/* Email Tips */}
                <div className="bg-white/5 rounded-xl p-4 text-left">
                  <p className="text-gray-300 text-sm mb-2">📧 <strong>Didn&apos;t receive the email?</strong></p>
                  <ul className="text-gray-400 text-xs space-y-1 ml-4">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure the email address is correct</li>
                    <li>• Wait a few minutes for delivery</li>
                  </ul>
                </div>
              </div>

              {/* Resend Button */}
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading}
                className="w-full py-3 px-6 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {cooldown > 0 ? (
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {cooldown}s
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Resend Email
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Remember your password?{' '}
            <Link 
              href="/login" 
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-400" /> by EventHub Team
          </p>
        </div>
      </div>
    </div>
  );
}

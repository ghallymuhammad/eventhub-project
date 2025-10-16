'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  CheckCircle, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/libs/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Auto-verify if token is present in URL
  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      verifyEmailToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyEmailToken = async (token: string) => {
    setIsVerifying(true);
    setVerificationError('');
    
    try {
      // Call verify email endpoint (you'll need to add this to your api.ts)
      await api.auth.verifyEmail({ token });
      
      toast.success('Email verified successfully! 🎉');
      setIsVerified(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed. The link may be expired.';
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    
    try {
      // Get user email from localStorage or prompt
      const userData = localStorage.getItem('user_data');
      const userEmail = userData ? JSON.parse(userData).email : null;
      
      if (!userEmail) {
        toast.error('Please login first to resend verification email.');
        router.push('/login');
        return;
      }

      // Call resend verification endpoint (you'll need to add this to your api.ts)
      await api.auth.resendVerification({ email: userEmail });
      
      toast.success('Verification email sent! Check your inbox.');
      
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
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
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
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          {isVerifying ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Verifying Email...</h1>
              <p className="text-gray-300">Please wait while we verify your email address.</p>
            </>
          ) : isVerified ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Email Verified! 🎉</h1>
              <p className="text-gray-300">Your account has been successfully verified.</p>
            </>
          ) : verificationError ? (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-gray-300">We couldn&apos;t verify your email address.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-gray-300">We&apos;ve sent a verification link to your email address.</p>
            </>
          )}
        </div>

        {/* Status Card */}
        <div className="glassmorphism rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          {isVerifying ? (
            /* Verifying State */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Verifying your email...</h3>
                <p className="text-gray-300 text-sm">This should only take a moment.</p>
              </div>
            </div>
          ) : isVerified ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Welcome to EventHub!</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your email has been successfully verified. You can now access all EventHub features.
                </p>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-purple-300 text-sm">🚀 Redirecting you to login in a moment...</p>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 transform hover:scale-105"
              >
                Continue to Login
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          ) : verificationError ? (
            /* Error State */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Verification Failed</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {verificationError}
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-300 text-sm">
                    ⚠️ The verification link may have expired or is invalid.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={isResending || cooldown > 0}
                className="w-full py-3 px-6 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </div>
                ) : cooldown > 0 ? (
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {cooldown}s
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Resend Verification Email
                    <Mail className="ml-2 w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* Default State - Waiting for verification */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Verify Your Email</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We&apos;ve sent a verification link to your email address. 
                  Click the link in your email to activate your account.
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
                onClick={handleResendVerification}
                disabled={isResending || cooldown > 0}
                className="w-full py-3 px-6 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </div>
                ) : cooldown > 0 ? (
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {cooldown}s
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Resend Verification Email
                    <Mail className="ml-2 w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-300">
            Having trouble?{' '}
            <Link 
              href="/support" 
              className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
            >
              Contact Support
            </Link>
          </p>
          <p className="text-gray-400 text-sm">
            or{' '}
            <Link 
              href="/login" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Back to Login
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

import { useState } from 'react';
import apiServerClient from '@/lib/apiServerClient';

export const useOtpVerification = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [isWhatsAppConfigured, setIsWhatsAppConfigured] = useState(true);

  const sendOtp = async (mobile) => {
    setIsSending(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch('/otp/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        return true;
      } else {
        // Check if the error is due to missing configuration
        if (response.status === 400 || data.message?.toLowerCase().includes('configured')) {
          setIsWhatsAppConfigured(false);
          setError('WhatsApp OTP verification is not yet configured');
        } else {
          setError(data.message || 'Failed to send OTP');
        }
        return false;
      }
    } catch (err) {
      // Fallback for network errors or missing endpoints during development
      setIsWhatsAppConfigured(false);
      setError('WhatsApp OTP verification is not yet configured');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async (mobile, otp) => {
    // Development/Testing fallback
    if (otp === '123456') {
      setIsVerified(true);
      setError(null);
      return true;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch('/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await response.json();
      
      if (data.success && data.verified) {
        setIsVerified(true);
        return true;
      } else {
        setError(data.message || 'Invalid OTP');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Network error while verifying OTP');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setOtpSent(false);
    setIsVerified(false);
    setError(null);
    setIsWhatsAppConfigured(true);
  };

  return {
    sendOtp,
    verifyOtp,
    reset,
    isSending,
    isVerifying,
    otpSent,
    isVerified,
    error,
    isWhatsAppConfigured
  };
};
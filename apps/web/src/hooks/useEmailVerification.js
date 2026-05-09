import { useState } from 'react';
import apiServerClient from '@/lib/apiServerClient';

export const useEmailVerification = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);

  const sendVerification = async (email) => {
    setIsSending(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch('/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (data.success) {
        setCodeSent(true);
        return true;
      } else {
        setError(data.message || 'Failed to send verification code');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Network error while sending code');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (email, code) => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch('/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      
      if (data.success && data.verified) {
        setIsVerified(true);
        return true;
      } else {
        setError(data.message || 'Invalid verification code');
        return false;
      }
    } catch (err) {
      setError(err.message || 'Network error while verifying code');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setCodeSent(false);
    setIsVerified(false);
    setError(null);
  };

  return {
    sendVerification,
    verifyCode,
    reset,
    isSending,
    isVerifying,
    codeSent,
    isVerified,
    error
  };
};
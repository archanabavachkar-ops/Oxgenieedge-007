export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, error: 'Email is required' };
  if (!re.test(email)) return { isValid: false, error: 'Invalid email format' };
  return { isValid: true, error: '' };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: 'Password is required' };
  if (password.length < 8) return { isValid: false, error: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { isValid: false, error: 'Must contain uppercase letter' };
  if (!/[a-z]/.test(password)) return { isValid: false, error: 'Must contain lowercase letter' };
  if (!/[0-9]/.test(password)) return { isValid: false, error: 'Must contain number' };
  return { isValid: true, error: '' };
};

export const validatePhone = (phone) => {
  const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/;
  if (!phone) return { isValid: false, error: 'Phone number is required' };
  if (!re.test(phone) || phone.length < 10) return { isValid: false, error: 'Invalid phone format' };
  return { isValid: true, error: '' };
};

export const validateURL = (url) => {
  if (!url) return { isValid: true, error: '' }; // Optional by default
  try {
    new URL(url);
    return { isValid: true, error: '' };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateRequired = (value) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, error: 'This field is required' };
  }
  return { isValid: true, error: '' };
};

export const validateMinLength = (value, min) => {
  if (!value || value.length < min) return { isValid: false, error: `Minimum ${min} characters required` };
  return { isValid: true, error: '' };
};

export const validateMaxLength = (value, max) => {
  if (value && value.length > max) return { isValid: false, error: `Maximum ${max} characters allowed` };
  return { isValid: true, error: '' };
};

export const validateMatch = (value1, value2) => {
  if (value1 !== value2) return { isValid: false, error: 'Values do not match' };
  return { isValid: true, error: '' };
};

export const validatePasswordStrength = (password) => {
  const reqs = {
    minLength: (password || '').length >= 8,
    hasUppercase: /[A-Z]/.test(password || ''),
    hasLowercase: /[a-z]/.test(password || ''),
    hasNumbers: /[0-9]/.test(password || ''),
    hasSpecialChars: /[^A-Za-z0-9]/.test(password || '')
  };

  let score = Object.values(reqs).filter(Boolean).length;
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'good';
  else if (score >= 2) strength = 'fair';

  return { strength, score, requirements: reqs };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validate phone number (E.164 international format loosely)
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = String(phone).replace(/\s|-/g, '');
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate required field is present and not empty
 */
export const validateRequired = (field, value) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

/**
 * Validate length of string
 */
export const validateLength = (value, min, max) => {
  if (!value) return false;
  const str = String(value).trim();
  return str.length >= min && str.length <= max;
};

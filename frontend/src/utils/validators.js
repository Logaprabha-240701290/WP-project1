export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

export const isValidPhone = (phone) => {
  if (!phone) return true; // optional in some forms
  // 10 digits (allows optional +91 or dashes/spaces)
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  return /^\d{10,12}$/.test(cleanPhone);
};

export const validateImageFile = (file) => {
  if (!file) return { valid: true };

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed.' };
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size exceeds the 2MB limit.' };
  }

  return { valid: true };
};

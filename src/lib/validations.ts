export interface ValidationErrors {
  [key: string]: string;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 20) return `Name must be at least 20 characters (currently ${name.trim().length})`;
  if (name.trim().length > 60) return 'Name must be at most 60 characters';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
}

export function validateAddress(address: string): string | null {
  if (!address.trim()) return 'Address is required';
  if (address.trim().length > 400) return 'Address must be at most 400 characters';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 16) return 'Password must be at most 16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must include at least one special character';
  return null;
}

export function validateRating(rating: number): string | null {
  if (rating < 1 || rating > 5) return 'Rating must be between 1 and 5';
  return null;
}

export function validateSignupForm(data: { name: string; email: string; address: string; password: string }): ValidationErrors {
  const errors: ValidationErrors = {};
  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const addressErr = validateAddress(data.address);
  if (addressErr) errors.address = addressErr;
  const passwordErr = validatePassword(data.password);
  if (passwordErr) errors.password = passwordErr;
  return errors;
}

export function validateAddUserForm(data: { name: string; email: string; address: string; password: string; role: string }): ValidationErrors {
  const errors = validateSignupForm(data);
  if (!data.role) errors.role = 'Role is required';
  return errors;
}

export function validateStoreForm(data: { name: string; email: string; address: string; owner_id?: string }): ValidationErrors {
  const errors: ValidationErrors = {};
  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const addressErr = validateAddress(data.address);
  if (addressErr) errors.address = addressErr;
  return errors;
}

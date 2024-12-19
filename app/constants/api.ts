export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const CAPTHCA_API = `${API_BASE_URL}/captcha`;
export const SIGN_UP_API = `${API_BASE_URL}/auth/signup`;

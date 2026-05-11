import { apiClient } from './client';

export interface TokenInfo {
  type: string;
  limits: string;
  userId: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface MfaInfo {
  required: boolean;
  methods: string[];
}

export interface ApiTokenRecord {
  jti: string;
  title: string;
  writeAccess: boolean;
  createdAt: string;
}

type Captcha = { id: string; value: string };

export const authApi = {
  async signUp(data: { username: string; email: string; password: string }, captcha: Captcha) {
    return apiClient.post<void>('/auth/signup', data, captcha);
  },

  async sign(data: { login: string; password: string }, captcha?: Captcha) {
    return apiClient.post<MfaInfo>('/auth/sign', data, captcha);
  },

  async info() {
    return apiClient.get<TokenInfo>('/auth/info');
  },

  async refresh() {
    return apiClient.post<void>('/auth/refresh');
  },

  async logout() {
    return apiClient.post<void>('/auth/logout');
  },

  async terminate() {
    return apiClient.post<void>('/auth/terminate');
  },

  async lostPasswordSendEmail(email: string, captcha: Captcha) {
    return apiClient.post<void>('/auth/lost-password/send-email', { email }, captcha);
  },

  async lostPasswordVerify(userId: string, token: string) {
    return apiClient.post<void>('/auth/lost-password/verify', { userId, token });
  },

  async lostPasswordChange(userId: string, token: string, password: string) {
    return apiClient.post<void>('/auth/lost-password/change', { userId, token, password });
  },

  async changePassword(oldPassword: string, newPassword: string) {
    return apiClient.post<void>('/auth/change-password', { oldPassword, newPassword });
  },

  async getMfa() {
    return apiClient.get<MfaInfo>('/auth/mfa');
  },

  async setMfaRequired(required: boolean) {
    return apiClient.post<void>('/auth/mfa', { required });
  },

  async sendEmailMfaCode() {
    return apiClient.post<void>('/auth/mfa/email/send-code');
  },

  async confirmEmailMfaCode(userId: string, code: string) {
    return apiClient.post<{ isTokenVerifyRequired: boolean }>(
      '/auth/mfa/email/confirm',
      { userId, code },
    );
  },

  async cancelEmailMfaCode() {
    return apiClient.delete<void>('/auth/mfa/email/cancel');
  },

  async verifyEmailConfirm() {
    return apiClient.get<{ confirmed: boolean }>('/auth/mfa/email/verify');
  },

  async disableTotp() {
    return apiClient.delete<void>('/auth/mfa/totp');
  },

  async initTotp() {
    return apiClient.post<{ uri: string }>('/auth/mfa/totp/init');
  },

  async confirmTotp(token: string) {
    return apiClient.post<void>('/auth/mfa/totp/confirm', { token });
  },

  async getApiTokens() {
    return apiClient.get<{ tokens: ApiTokenRecord[] }>('/auth/api-tokens');
  },

  async createApiToken(title: string, writeAccess: boolean) {
    return apiClient.post<{ token: string }>('/auth/api-tokens', { title, writeAccess });
  },

  async deleteAllApiTokens() {
    return apiClient.delete<void>('/auth/api-tokens');
  },

  async getApiToken(jti: string) {
    return apiClient.get<ApiTokenRecord>(`/auth/api-tokens/${jti}`);
  },

  async deleteApiToken(jti: string) {
    return apiClient.delete<void>(`/auth/api-tokens/${jti}`);
  },
};

export enum EmailTemplatesEnum {
  CONFIRM_EMAIL = 'confirm.mail',
  MFA_EMAIL = 'mfa.mail',
  RESET_PASSWORD = 'reset-password.mail',
}

interface EmailTemplateOtpContext {
  appName: string;
  otp: string;
  username: string;
  url: string;
}

interface EmailTemplateResetPasswordContext {
  appName: string;
  username: string;
  url: string;
}

export type EmailTemplateContexts =
  | {
      template: EmailTemplatesEnum.CONFIRM_EMAIL;
      context: EmailTemplateOtpContext;
    }
  | { template: EmailTemplatesEnum.MFA_EMAIL; context: EmailTemplateOtpContext }
  | {
      template: EmailTemplatesEnum.RESET_PASSWORD;
      context: EmailTemplateResetPasswordContext;
    };

export const EmailTemplateSubjects: Record<EmailTemplatesEnum, string> = {
  [EmailTemplatesEnum.CONFIRM_EMAIL]: `Confirm email for Helizium`,
  [EmailTemplatesEnum.MFA_EMAIL]: `Confirm OTP for Helizium`,
  [EmailTemplatesEnum.RESET_PASSWORD]: `Password reset request for Helizium`,
};

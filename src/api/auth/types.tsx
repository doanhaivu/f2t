import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateFarmRequest,
} from '@/types/api';
import type { AuthUserData } from '@/lib/auth/utils';

export type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateFarmRequest,
  AuthUserData,
};

// Farm registration combines user registration with farm creation
export type FarmRegisterRequest = RegisterRequest & {
  farmInfo: CreateFarmRequest;
  acceptTerms: boolean;
  businessLicense?: string;
};

// Phone verification
export type VerifyPhoneRequest = {
  phoneNumber: string;
  verificationCode: string;
};

export type SendPhoneVerificationRequest = {
  phoneNumber: string;
};

// Email verification
export type VerifyEmailRequest = {
  email: string;
  verificationCode: string;
};

export type SendEmailVerificationRequest = {
  email: string;
};

// Success responses
export type VerificationResponse = {
  success: boolean;
  message: string;
  verified: boolean;
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};

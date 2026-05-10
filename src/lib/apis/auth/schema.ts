type Role = "freelancer" | "client";

interface UserRead {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  paid_user?: boolean | null;
  paid_date?: string | null;
}

interface LoginSchema {
  email: string;
  password: string;
}

interface RegisterSchema {
  name: string;
  email: string;
  role: Role;
  password: string;
}

interface UpdateProfileSchema {
  name?: string;
  email?: string;
  avatar?: string;
  password?: string;
}

interface ForgotPasswordSchema {
  email: string;
}

interface VerifyOtpSchema {
  email: string;
  otp: string;
}

interface ResetPasswordSchema {
  email: string;
  new_password: string;
}

interface UserLoginResponse {
  access_token: string;
  token_type: string | "bearer";
  user: UserRead;
}

export type {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
  UserLoginResponse,
  UserRead,
  UpdateProfileSchema,
};

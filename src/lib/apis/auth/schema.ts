type Role = "freelancer" | "client";

interface UserRead {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
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

interface UserLoginResponse {
  access_token: string;
  token_type: string | "bearer";
  user: UserRead;
}

export type { LoginSchema, RegisterSchema, ForgotPasswordSchema, UserLoginResponse, UserRead, UpdateProfileSchema };
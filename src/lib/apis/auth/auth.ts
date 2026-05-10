import { get, post, put, del } from "@/lib/https";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  VerifyOtpSchema,
  ResetPasswordSchema,
  UserLoginResponse,
  UpdateProfileSchema,
  UserRead,
} from "@/lib/apis/auth/schema";
import { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";

// /api/v1/users — legacy JSON login/signup (cookie auth uses /auth below)
const ENDPOINT = "/users";
const auth_api_endpoint = `${API_PREFIX}${ENDPOINT}`;
const cookie_auth_endpoint = `${API_PREFIX}/auth`;

const authApi = {
  login: `${auth_api_endpoint}/login`,
  signup: `${auth_api_endpoint}/signup`,
  forgotPassword: `${cookie_auth_endpoint}/forgot-password`,
  verifyOtp: `${cookie_auth_endpoint}/verify-otp`,
  resetPassword: `${cookie_auth_endpoint}/reset-password`,
  updateProfile: `${auth_api_endpoint}/update-user`,
  getProfile: `${auth_api_endpoint}/me`,
  deleteUser: `${auth_api_endpoint}/delete-user`,
};
export const login = async (data: LoginSchema) => {
  const response = await post<APIResponse<UserLoginResponse>>(
    authApi.login,
    data,
  );
  return response;
};

export const signup = async (data: RegisterSchema) => {
  const response = await post<APIResponse<UserLoginResponse>>(
    authApi.signup,
    data,
  );
  return response;
};

export const updateProfile = async (data: UpdateProfileSchema) => {
  const response = await put<APIResponse<UserRead>>(
    authApi.updateProfile,
    data,
  );
  return response;
};

export const deleteUser = async () => {
  const response = await del<APIResponse<null>>(authApi.deleteUser);
  return response;
};

export const forgotPassword = async (data: ForgotPasswordSchema) => {
  const response = await post<APIResponse<null>>(authApi.forgotPassword, data);
  return response;
};

export const verifyPasswordResetOtp = async (data: VerifyOtpSchema) => {
  const response = await post<APIResponse<null>>(authApi.verifyOtp, data);
  return response;
};

export const resetPasswordAfterOtp = async (data: ResetPasswordSchema) => {
  const response = await post<APIResponse<null>>(authApi.resetPassword, data);
  return response;
};

export const getProfile = async () => {
  const response = await get<APIResponse<UserRead>>(authApi.getProfile);
  return response;
};

export const getUserById = async (userId: number) => {
  const response = await get<APIResponse<UserRead>>(
    `${auth_api_endpoint}/${userId}`,
  );
  return response;
};

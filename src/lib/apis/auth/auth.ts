import { get, post, put, del } from "@/lib/https";
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  UserLoginResponse,
  UpdateProfileSchema,
  UserRead,
} from "@/lib/apis/auth/schema";
import { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";

// /api/v1/users
const ENDPOINT = "/users";
const auth_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

const authApi = {
  login: `${auth_api_endpoint}/login`,
  signup: `${auth_api_endpoint}/signup`,
  forgotPassword: `${auth_api_endpoint}/forgot-password`,
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

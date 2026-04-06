// A TypeScript interface for standard API responses

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: any;
}

export const API_PREFIX = "/api/v1";
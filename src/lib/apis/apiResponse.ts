// A TypeScript interface for standard API responses

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: unknown;
}

// export interface APIResponseBoolean {
//   success: boolean;
//   message?: string;
// }

export const API_PREFIX = "/api/v1";
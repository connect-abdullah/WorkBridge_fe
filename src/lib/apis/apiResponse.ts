// A TypeScript interface for standard API responses
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: any | null;
}

// export interface APIResponseBoolean {
//   success: boolean;
//   message?: string;
// }

export const API_PREFIX = "/api/v1";
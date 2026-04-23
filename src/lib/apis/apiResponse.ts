// A TypeScript interface for standard API responses

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any | null;
}

// export interface APIResponseBoolean {
//   success: boolean;
//   message?: string;
// }

export const API_PREFIX = "/api/v1";

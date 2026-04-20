export interface WaitlistBase {
  name: string;
  email: string;
  city: string;
}

export type WaitlistCreate = WaitlistBase;

export interface WaitlistRead extends WaitlistBase {
  id: number;
}


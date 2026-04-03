export type UserRole = "freelancer" | "client";

export type ProfileUser = {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
};

export const profileUser: ProfileUser = {
  name: "Aisha Johnson",
  email: "aisha@workbridge.io",
  role: "freelancer",
  initials: "AJ",
} as const;


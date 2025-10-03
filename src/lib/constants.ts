import { Role } from "@/generated/prisma";

export const LANGUAGES = [
  { value: "ar", label: "arabic" },
  { value: "en", label: "english" },
  { value: "fr", label: "french" },
  { value: "es", label: "spanish" },
  { value: "de", label: "german" },
];

export const USER_ROLES: Record<Role, { label: string; access: number }> = {
  // change "priority" for a more meaningful name like "level" or "rank"
  [Role.OWNER]: { label: "owner", access: 3 },
  [Role.MANAGER]: { label: "manager", access: 2 },
  [Role.ADMIN]: { label: "admin", access: 1 },
};

import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().optional(),
    bio: z.string().max(500, "Bio is too long").optional(),
    // Add other fields if applicable
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url("Invalid URL").optional(),
  }),
});

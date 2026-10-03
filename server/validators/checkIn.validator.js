import { z } from "zod";

export const checkInSchema = z.object({
  body: z.object({
    mood: z.enum(["great", "good", "okay", "tired", "stressed"]).optional(),
    energyLevel: z.number().min(1).max(5).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }),
});

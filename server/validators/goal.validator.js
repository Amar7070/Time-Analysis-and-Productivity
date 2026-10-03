import { z } from "zod";

export const saveGoalsSchema = z.object({
  body: z.object({
    goals: z.array(
      z.object({
        category: z.string().min(1, "Category is required"),
        targetHours: z.number().min(0, "Target hours must be non-negative"),
        targetFocusScore: z.number().min(0).max(10).optional(),
      })
    ),
    period: z.enum(["weekly", "monthly"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getGoalsSchema = z.object({
  query: z.object({
    period: z.enum(["weekly", "monthly"]).optional(),
  }),
});

export const updateGoalProgressSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Goal ID"),
  }),
  body: z.object({
    currentHours: z.number().min(0).optional(),
    currentFocusScore: z.number().min(0).max(10).optional(),
  }),
});

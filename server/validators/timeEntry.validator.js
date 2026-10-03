import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createTimeEntrySchema = z.object({
  body: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
    timestamp: z.string().optional(), // Or Date
  }),
});

export const stopTimeEntrySchema = z.object({
  params: z.object({
    entryId: z.string().regex(objectIdPattern, "Invalid Time Entry ID"),
  }),
  body: z.object({
    timestamp: z.string().optional(),
    completionStatus: z.enum(["completed", "incomplete"]).optional(),
  }),
});

export const logInterruptionSchema = z.object({
  params: z.object({
    entryId: z.string().regex(objectIdPattern, "Invalid Time Entry ID"),
  }),
  body: z.object({
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    reason: z.string().optional(),
  }),
});

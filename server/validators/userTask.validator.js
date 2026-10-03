import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createUserTaskSchema = z.object({
  body: z.object({
    taskTitle: z.string().min(1, "Title is required"),
    taskDescription: z.string().optional(),
    category: z.string().optional(),
    priorityLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
    deadlineDate: z.string().optional(),
    estimatedDurationInMinutes: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateUserTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    taskTitle: z.string().optional(),
    taskDescription: z.string().optional(),
    category: z.string().optional(),
    taskStatus: z.enum(["pending", "in_progress", "completed", "overdue", "archived"]).optional(),
    priorityLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
    deadlineDate: z.string().optional(),
    estimatedDurationInMinutes: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTaskProgressSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    timeSpentInMinutes: z.number().min(0).optional(),
    focusScore: z.number().min(1).max(5).optional(),
    isCompleted: z.boolean().optional(),
    userRating: z.number().min(1).max(5).optional(),
    feedback: z.any().optional(),
  }),
});

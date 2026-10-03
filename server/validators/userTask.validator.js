import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createUserTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateUserTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in-progress", "completed", "archived"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateTaskProgressSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    progress: z.number().min(0).max(100),
  }),
});

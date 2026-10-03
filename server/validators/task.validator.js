import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().regex(objectIdPattern, "Invalid Project ID"),
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    status: z.enum(["todo", "in-progress", "review", "completed", "blocked"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    assignedTo: z.string().regex(objectIdPattern, "Invalid User ID").optional().nullable(),
    tags: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    isPrivate: z.boolean().optional(),
    subtasks: z.array(z.any()).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["todo", "in-progress", "review", "completed", "blocked"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    loggedHours: z.number().min(0).optional(),
    assignedTo: z.string().regex(objectIdPattern, "Invalid User ID").optional().nullable(),
    labels: z.array(z.string()).optional(),
    isPrivate: z.boolean().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    status: z.enum(["todo", "in-progress", "review", "completed", "blocked"]),
  }),
});

export const taskIdParamsSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
});

export const addSubtaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(objectIdPattern, "Invalid Task ID"),
  }),
  body: z.object({
    title: z.string().min(1, "Subtask title is required"),
    estimatedHours: z.number().min(0).optional(),
    dueDate: z.string().optional(),
    assignedTo: z.string().regex(objectIdPattern, "Invalid User ID").optional().nullable(),
  }),
});

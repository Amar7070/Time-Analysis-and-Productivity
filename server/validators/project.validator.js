import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    color: z.string().optional(),
    tags: z.array(z.string()).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    managingUserId: z.string().regex(objectIdPattern, "Invalid User ID").optional(),
    startDate: z.string().optional(), // Or check date format
    endDate: z.string().min(1, "End date is required"),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdPattern, "Invalid Project ID"),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    tags: z.array(z.string()).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["Started", "In Progress", "Completed"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    managingUserId: z.array(z.string().regex(objectIdPattern, "Invalid User ID")).optional(),
  }),
});

export const projectActionSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdPattern, "Invalid Project ID"),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdPattern, "Invalid Project ID"),
  }),
  body: z.object({
    userId: z.string().regex(objectIdPattern, "Invalid User ID"),
  }),
});

import express from "express";
import {
  createQuickTask,
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  getTasks,
} from "../controllers/taskController.js";
import {
  addSubtask,
  deleteSubtask,
  logSubtaskHours,
  updateSubtask,
} from "../controllers/subTaskControllers.js";
import {
  addComment,
  addCommentReaction,
  addReply,
  addReplyReaction,
  getSubtaskComments,
} from "../controllers/commentControllers.js";

import validate from "../middleware/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskIdParamsSchema,
  addSubtaskSchema,
} from "../validators/task.validator.js";

const router = express.Router();

// task creation API
router.post("/", validate(createTaskSchema), createTask);
router.post("/quick", validate(createTaskSchema), createQuickTask); // Reuses createTaskSchema because it requires title and projectId
router.put("/:taskId", validate(updateTaskSchema), updateTask);
router.put("/:taskId/status", validate(updateTaskStatusSchema), updateTaskStatus);
router.delete("/:taskId", validate(taskIdParamsSchema), deleteTask);

// Sub Task API
router.get("/", getTasks); // Optional: add query param validation for getTasks if needed
router.post("/:taskId/subtasks", validate(addSubtaskSchema), addSubtask);
router.put("/:taskId/subtasks/:subtaskId", updateSubtask); // Optional: add validator
router.delete("/:taskId/subtasks/:subtaskId", deleteSubtask); // Optional: add validator
router.post("/:taskId/subtasks/:subtaskId/time", logSubtaskHours); // Optional: add validator

// task comment API
router.post("/:taskId/subtasks/:subtaskId/comments", addComment);
router.post(
  "/:taskId/subtasks/:subtaskId/comments/:commentId/replies",
  addReply
);
router.get("/:taskId/subtasks/:subtaskId/comments", getSubtaskComments);
router.post(
  "/:taskId/subtasks/:subtaskId/comments/:commentId/reactions",
  addCommentReaction
);
router.post(
  "/:taskId/subtasks/:subtaskId/comments/:commentId/replies/:replyId/reactions",
  addReplyReaction
);

export default router;

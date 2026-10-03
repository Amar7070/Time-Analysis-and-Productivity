import express from "express";
import {
  getUserTasks,
  createUserTask,
  updateUserTask,
  updateTaskProgress,
  getTaskAnalytics,
  deleteUserTask,
} from "../../controllers/personal/userTask.js";

import validate from "../../middleware/validate.js";
import {
  createUserTaskSchema,
  updateUserTaskSchema,
  updateTaskProgressSchema,
} from "../../validators/userTask.validator.js";

const router = express.Router();

router.route("/").get(getUserTasks).post(validate(createUserTaskSchema), createUserTask);

router.route("/:taskId").put(validate(updateUserTaskSchema), updateUserTask).delete(deleteUserTask);

router.route("/:taskId/progress").put(validate(updateTaskProgressSchema), updateTaskProgress);

router.route("/:taskId/analytics").get(getTaskAnalytics);

export default router;

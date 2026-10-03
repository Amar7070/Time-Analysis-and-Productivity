import express from "express";
import {
  createProductivityGoal,
  getProductivityGoals,
  updateGoalProgress,
} from "../../controllers/personal/productivityGoal.js";

import validate from "../../middleware/validate.js";
import {
  saveGoalsSchema,
  getGoalsSchema,
  updateGoalProgressSchema,
} from "../../validators/goal.validator.js";

const router = express.Router();

router.route("/").post(validate(saveGoalsSchema), createProductivityGoal).get(validate(getGoalsSchema), getProductivityGoals);

router.route("/:id/progress").put(validate(updateGoalProgressSchema), updateGoalProgress);

export default router;

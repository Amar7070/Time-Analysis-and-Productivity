import express from "express";
import {
  createDailyCheckIn,
  getTodayCheckIn,
  getCheckInHistory,
} from "../../controllers/personal/dailyCheckIn.js";

import validate from "../../middleware/validate.js";
import { checkInSchema } from "../../validators/checkIn.validator.js";

const router = express.Router();

router.route("/").post(validate(checkInSchema), createDailyCheckIn);
router.route("/today").get(getTodayCheckIn);
router.route("/history").get(getCheckInHistory);

export default router;

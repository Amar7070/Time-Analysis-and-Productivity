import express from "express";
import {
  createTimeEntry,
  stopTimeEntry,
  getUserTimeEntries,
  getActiveTimeEntry,
  logInterruption,
  updateTimeEntry,
  deleteTimeEntry,
} from "../../controllers/personal/timeEntry.js";

import validate from "../../middleware/validate.js";
import {
  createTimeEntrySchema,
  stopTimeEntrySchema,
  logInterruptionSchema,
} from "../../validators/timeEntry.validator.js";

const router = express.Router();

router.route("/").post(validate(createTimeEntrySchema), createTimeEntry).get(getUserTimeEntries);

router.route("/current").get(getActiveTimeEntry);

router.route("/:entryId").put(updateTimeEntry).delete(deleteTimeEntry); // Optional: add simple params validator

router.put("/:entryId/stop", validate(stopTimeEntrySchema), stopTimeEntry);
router.post("/:entryId/interruptions", validate(logInterruptionSchema), logInterruption);

export default router;

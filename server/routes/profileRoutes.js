import express from "express";
import {
  deleteProfilePic,
  getProfileInfo,
  updatePassword,
  updatePersonalDetails,
  updateProfileAvatar,
} from "../controllers/profileControllers.js";
import uploadRoutes from "./uploadRoutes.js";

import validate from "../middleware/validate.js";
import {
  updateProfileSchema,
  updatePasswordSchema,
  updateAvatarSchema,
} from "../validators/profile.validator.js";

const router = express.Router();

// Upload route
router.use("/upload", uploadRoutes);
router.put("/update-avatar", validate(updateAvatarSchema), updateProfileAvatar);

// Profile routes
router.get("/details", getProfileInfo);
router.put("/update-profile-data-personal-details", validate(updateProfileSchema), updatePersonalDetails);
router.put("/update-password", validate(updatePasswordSchema), updatePassword);
router.delete("/remove-avatar", deleteProfilePic);

export default router;

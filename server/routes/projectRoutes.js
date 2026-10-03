import express from "express";
import {
  addProject,
  deleteProject,
  getAllUserProjects,
  getAllUsers,
  getProjectTasks,
  restoreProject,
  updateProject,
} from "../controllers/projectControllers.js";
import {
  getProjectFullDetails,
  getProjectAnalytics,
} from "../controllers/projectDataControllers.js";
import {
  addProjectMember,
  getProjectMembers,
  revokeProjectMember,
  softRemoveProjectMember,
  restoreProjectMember,
  suspendProjectMember,
} from "../controllers/projectMembersController.js";

import validate from "../middleware/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectActionSchema,
  addMemberSchema,
} from "../validators/project.validator.js";

const router = express.Router();

// get all the user list for the create task
router.get("/get-all-users-for-task-list-assingment", getAllUsers);

router.get("/get-all-user-project", getAllUserProjects);
router.get("/get-all-project-details/:projectId", validate(projectActionSchema), getProjectFullDetails);

// get project task
router.get("/:projectId/tasks", validate(projectActionSchema), getProjectTasks);

// project actions
router.post("/add-project", validate(createProjectSchema), addProject);
router.patch("/delete-project/:projectId", validate(projectActionSchema), deleteProject);

router.patch("/restore-project/:projectId", validate(projectActionSchema), restoreProject);
router.put("/update-project/:projectId", validate(updateProjectSchema), updateProject);

// Get all members of a project
router.get("/:projectId/members", validate(projectActionSchema), getProjectMembers);
router.post("/:projectId/members", validate(addMemberSchema), addProjectMember);
router.put("/:projectId/members/suspend", validate(addMemberSchema), suspendProjectMember);
router.put("/:projectId/members/revoke", validate(addMemberSchema), revokeProjectMember);
router.put("/:projectId/members/remove", validate(addMemberSchema), softRemoveProjectMember);
router.put("/:projectId/members/restore", validate(addMemberSchema), restoreProjectMember);

// Analytics
router.get("/:projectId/analytics", getProjectAnalytics);

export default router;

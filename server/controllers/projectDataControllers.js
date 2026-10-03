import { getProjectDetails, getProjectAnalyticsData } from "../services/projectDataService.js";

export const getProjectFullDetails = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const currentUserId = req.user.id;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await getProjectDetails(projectId, currentUserId);

    return res.status(200).json({
      success: true,
      message: "Project Fetched Successfully",
      projects: [project],
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const analyticsData = await getProjectAnalyticsData(projectId);

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};

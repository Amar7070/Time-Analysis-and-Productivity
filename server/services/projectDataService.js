import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getProjectDetails = async (projectId, currentUserId) => {
  const project = await Project.findById(projectId)
    .populate("teamMembers", "_id firstName lastName email avatar")
    .populate("suspendedMembers", "_id firstName lastName email avatar")
    .populate("removedMembers", "_id firstName lastName email avatar")
    .populate("invitedMembers", "_id firstName lastName email avatar")
    .populate("managingUserId", "_id firstName lastName email avatar")
    .populate("projectStartedBy", "_id firstName lastName email avatar")
    .lean();

  if (!project) {
    const error = new Error("Project not found");
    error.status = 404;
    error.isOperational = true;
    throw error;
  }

  project.currentUserId = currentUserId;

  const tasks = await Task.find({ projectId: project._id })
    .populate("createdBy", "_id firstName lastName email avatar")
    .populate("assignedTo", "_id firstName lastName email avatar")
    .populate({
      path: "subtasks.assignedTo",
      select: "_id firstName lastName email avatar",
    })
    .lean();

  tasks.forEach((task) => {
    if (task.subtasks && task.subtasks.length) {
      task.subtasks.forEach((subtask) => {
        if (subtask.comments && subtask.comments.length) {
          subtask.comments.forEach((comment) => {
            comment.user = comment.user?._id ? comment.user : comment.user;
            comment.replies.forEach((reply) => {
              reply.user = reply.user?._id ? reply.user : reply.user;
              reply.reactions.forEach((reaction) => {
                reaction.user = reaction.user?._id ? reaction.user : reaction.user;
              });
            });
            comment.reactions.forEach((reaction) => {
              reaction.user = reaction.user?._id ? reaction.user : reaction.user;
            });
          });
        }
      });
    }
  });

  project.tasks = tasks;
  return project;
};

export const getProjectAnalyticsData = async (projectId) => {
  const tasks = await Task.find({ projectId })
    .populate("assignedTo", "firstName lastName email")
    .lean();

  const statusCounts = { todo: 0, "in-progress": 0, completed: 0 };
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  const memberStats = {};

  tasks.forEach((task) => {
    const status = task.status || "todo";
    if (statusCounts[status] !== undefined) statusCounts[status]++;

    const priority = task.priority || "medium";
    if (priorityCounts[priority] !== undefined) priorityCounts[priority]++;

    const assignee = task.assignedTo;
    const assigneeId = assignee ? assignee._id.toString() : "unassigned";
    const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : "Unassigned";

    if (!memberStats[assigneeId]) {
      memberStats[assigneeId] = {
        name: assigneeName,
        tasks: 0,
        loggedHours: 0,
        estimatedHours: 0,
      };
    }

    memberStats[assigneeId].tasks++;
    memberStats[assigneeId].loggedHours += task.loggedHours || 0;
    memberStats[assigneeId].estimatedHours += task.estimatedHours || 0;
  });

  const statusDistribution = [
    { name: "Todo", value: statusCounts.todo, color: "#9CA3AF" },
    { name: "In Progress", value: statusCounts["in-progress"], color: "#3B82F6" },
    { name: "Completed", value: statusCounts.completed, color: "#10B981" },
  ];

  const priorityDistribution = [
    { name: "Low", value: priorityCounts.low, color: "#10B981" },
    { name: "Medium", value: priorityCounts.medium, color: "#F59E0B" },
    { name: "High", value: priorityCounts.high, color: "#EF4444" },
    { name: "Critical", value: priorityCounts.critical, color: "#7F1D1D" },
  ];

  const memberWorkload = Object.values(memberStats).map((stat) => ({
    name: stat.name,
    Tasks: stat.tasks,
    "Logged Hours": Math.round(stat.loggedHours * 10) / 10,
    "Estimated Hours": Math.round(stat.estimatedHours * 10) / 10,
  }));

  const activeTasks = tasks.filter((t) => t.loggedHours > 0 || t.estimatedHours > 0);
  const taskEfficiency = activeTasks
    .map((t) => ({
      name: t.title.length > 20 ? t.title.substring(0, 20) + "..." : t.title,
      fullTitle: t.title,
      "Logged Hours": t.loggedHours || 0,
      "Estimated Hours": t.estimatedHours || 0,
      status: t.status,
      assignee: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "Unassigned",
    }))
    .sort((a, b) => b["Logged Hours"] - a["Logged Hours"]);

  const inefficientTasks = tasks
    .filter((t) => t.estimatedHours > 0 && t.loggedHours > t.estimatedHours)
    .map((t) => ({
      id: t._id,
      title: t.title,
      exceededBy: (t.loggedHours - t.estimatedHours).toFixed(1) + " hrs",
      sso: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : "Unassigned",
    }));

  const overdueTasks = tasks
    .filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed")
    .map((t) => ({
      id: t._id,
      title: t.title,
      dueDate: new Date(t.dueDate).toLocaleDateString(),
      daysOverdue: Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)),
    }));

  const suspicionTasks = tasks
    .filter((t) => t.loggedHours > 5 && t.status === "todo")
    .map((t) => ({
      id: t._id,
      title: t.title,
      loggedHours: t.loggedHours,
      reason: "High logged hours with 'Todo' status",
    }));

  const burnoutRisk = Object.values(memberStats)
    .filter((stat) => stat.estimatedHours > 40)
    .map((stat) => ({
      name: stat.name,
      totalHours: stat.estimatedHours.toFixed(1),
    }));

  return {
    statusDistribution,
    priorityDistribution,
    memberWorkload,
    taskEfficiency,
    advanced: {
      inefficientTasks,
      overdueTasks,
      suspicionTasks,
      burnoutRisk,
    },
  };
};

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET /api/dashboard - get dashboard stats
router.get('/', auth, async (req, res) => {
  try {
    // Get all projects the user belongs to
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks in these projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    const now = new Date();

    // Stats
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'inprogress').length;
    const doneTasks = allTasks.filter(t => t.status === 'done').length;
    const overdueTasks = allTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    // Tasks per user
    const userTaskMap = {};
    allTasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo._id.toString();
        const userName = task.assignedTo.name;
        if (!userTaskMap[userId]) {
          userTaskMap[userId] = { name: userName, count: 0 };
        }
        userTaskMap[userId].count++;
      }
    });
    const tasksPerUser = Object.values(userTaskMap).sort((a, b) => b.count - a.count);

    // Recent tasks (last 5)
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name color')
      .sort({ createdAt: -1 })
      .limit(5);

    // Overdue task details
    const overdueTaskDetails = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
      .slice(0, 5);

    res.json({
      stats: {
        totalProjects: projects.length,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks
      },
      tasksPerUser,
      recentTasks,
      overdueTaskDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

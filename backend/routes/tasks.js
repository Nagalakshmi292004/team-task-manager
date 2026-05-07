const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Helper
const isProjectAdmin = (project, userId) =>
  project.admin.toString() === userId.toString();

const isProjectMember = (project, userId) =>
  project.members.some(m => m.user.toString() === userId.toString()) ||
  isProjectAdmin(project, userId);

// GET /api/tasks?projectId=xxx - get tasks for a project
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - create task (admin only)
router.post('/', auth, [
  body('title').trim().isLength({ min: 2 }).withMessage('Title required'),
  body('projectId').notEmpty().withMessage('Project ID required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { title, description, projectId, assignedTo, priority, dueDate, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can create tasks' });
    }

    // Validate assignedTo is a member
    if (assignedTo && !isProjectMember(project, assignedTo)) {
      return res.status(400).json({ message: 'Assigned user is not a project member' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo'
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/tasks/:id - update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const isAdmin = isProjectAdmin(project, req.user._id);
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    // Members can only update status of their assigned tasks
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'You can only update your assigned tasks' });
    }

    if (!isAdmin) {
      // Members can only change status
      if (req.body.status) task.status = req.body.status;
    } else {
      // Admins can update everything
      const { title, description, assignedTo, priority, dueDate, status } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (status) task.status = status;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - delete task (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

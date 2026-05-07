const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper: check if user is admin of project
const isProjectAdmin = (project, userId) => {
  return project.admin.toString() === userId.toString();
};

// Helper: check if user is member of project
// const isProjectMember = (project, userId) => {
//   return project.members.some(m => m.user.toString() === userId.toString()) || 
//          isProjectAdmin(project, userId);
// };

const isProjectMember = (project, userId) => {
  const userIdStr = userId.toString();
  const adminMatch = project.admin.toString() === userIdStr;
  const memberMatch = project.members.some(m => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userIdStr;
  });
  return adminMatch || memberMatch;
};
// GET /api/projects - get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { admin: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('admin', 'name email').populate('members.user', 'name email');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - create project
router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      admin: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/projects/:id - get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id - update project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can update project' });
    }

    const { name, description, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/members - add member (admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userId, role: 'member' });
    await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId - remove member (admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (req.params.userId === project.admin.toString()) {
      return res.status(400).json({ message: 'Cannot remove project admin' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('admin', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id - delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectAdmin(project, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can delete project' });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

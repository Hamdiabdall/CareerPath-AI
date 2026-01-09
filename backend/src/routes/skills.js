const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { stringRules, objectIdRules } = require('../utils/validators');

/**
 * @route   GET /api/skills
 * @desc    Get all skills
 * @access  Private
 */
router.get('/', auth, skillController.getAllSkills);

/**
 * @route   POST /api/skills
 * @desc    Create a new skill
 * @access  Private (admin)
 */
router.post(
  '/',
  auth,
  roleGuard('admin'),
  stringRules('name', { required: true, max: 50 }),
  skillController.createSkill
);

/**
 * @route   DELETE /api/skills/:id
 * @desc    Delete a skill
 * @access  Private (admin)
 */
router.delete('/:id', auth, roleGuard('admin'), objectIdRules('id'), skillController.deleteSkill);

module.exports = router;

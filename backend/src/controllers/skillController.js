const { validationResult } = require('express-validator');
const skillService = require('../services/skillService');
const { ValidationError } = require('../utils/errors');

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Private
 */
const getAllSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getAllSkills();

    res.status(200).json({
      success: true,
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new skill
 * @route   POST /api/skills
 * @access  Private (admin)
 */
const createSkill = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { name } = req.body;
    const skill = await skillService.createSkill(name);

    res.status(201).json({
      success: true,
      data: { skill },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill
 * @route   DELETE /api/skills/:id
 * @access  Private (admin)
 */
const deleteSkill = async (req, res, next) => {
  try {
    await skillService.deleteSkill(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  createSkill,
  deleteSkill,
};

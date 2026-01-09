const { Skill, JobOffer } = require('../models');
const { NotFoundError, DuplicateSkillError } = require('../utils/errors');

/**
 * Create a new skill
 * @param {string} name - Skill name
 * @returns {Promise<Object>} Created skill
 */
const createSkill = async (name) => {
  // Check for duplicate
  const existing = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw new DuplicateSkillError();
  }

  const skill = await Skill.create({ name });
  return skill;
};

/**
 * Delete skill and remove from all job offers
 * @param {string} skillId - Skill ID
 * @returns {Promise<void>}
 */
const deleteSkill = async (skillId) => {
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new NotFoundError('Skill not found');
  }

  // Remove skill from all job offers
  await JobOffer.updateMany({ skills: skillId }, { $pull: { skills: skillId } });

  // Delete skill
  await skill.deleteOne();
};

/**
 * Get all skills sorted alphabetically
 * @returns {Promise<Array>} Skills
 */
const getAllSkills = async () => {
  const skills = await Skill.find().sort({ name: 1 }).collation({ locale: 'en', strength: 2 });
  return skills;
};

/**
 * Get skill by ID
 * @param {string} skillId - Skill ID
 * @returns {Promise<Object>} Skill
 */
const getSkillById = async (skillId) => {
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new NotFoundError('Skill not found');
  }
  return skill;
};

module.exports = {
  createSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
};

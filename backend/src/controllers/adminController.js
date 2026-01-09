const adminService = require('../services/adminService');
const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user (cascade based on role)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user to determine role
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User not found');

    // Cannot delete admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    // Cascade delete based on role
    if (user.role === 'recruiter') {
      await adminService.deleteRecruiter(id);
    } else if (user.role === 'candidate') {
      await adminService.deleteCandidate(id);
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job offer (admin override)
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private (admin)
 */
const deleteJobOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    await adminService.deleteJobOffer(id);

    res.status(200).json({
      success: true,
      message: 'Job offer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  deleteJobOffer,
};

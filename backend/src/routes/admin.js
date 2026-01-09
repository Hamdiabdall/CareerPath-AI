const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { objectIdRules } = require('../utils/validators');

// All admin routes require authentication and admin role
router.use(auth);
router.use(roleGuard('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (admin)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (cascade based on role)
 * @access  Private (admin)
 */
router.delete('/users/:id', objectIdRules('id'), adminController.deleteUser);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete a job offer (admin override)
 * @access  Private (admin)
 */
router.delete('/jobs/:id', objectIdRules('id'), adminController.deleteJobOffer);

module.exports = router;

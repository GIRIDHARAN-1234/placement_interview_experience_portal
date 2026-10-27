const express = require('express');
const router = express.Router();
const {
  getApprovedExperiences,
  getExperienceById,
  createExperience,
  voteHelpful,
  getMySubmissions,
} = require('../controllers/experienceController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { experienceValidation } = require('../validators/experienceValidator');
const { submitLimiter } = require('../middleware/rateLimiter');

router.get('/', getApprovedExperiences);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/:id', optionalAuth, getExperienceById);
router.post('/', protect, submitLimiter, experienceValidation, validate, createExperience);
router.post('/:id/helpful', protect, voteHelpful);

module.exports = router;

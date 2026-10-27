const express = require('express');
const router = express.Router();
const {
  getProgress,
  updateRoadmapStep,
  toggleQuestionCompleted,
  getReadinessScore,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProgress);
router.put('/roadmap-step', protect, updateRoadmapStep);
router.post('/toggle-question', protect, toggleQuestionCompleted);
router.get('/readiness-score', protect, getReadinessScore);

module.exports = router;

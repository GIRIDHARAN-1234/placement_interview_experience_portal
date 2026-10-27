const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  getCategories,
  getSmartPracticeSession,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuestions);
router.get('/categories', getCategories);
router.post('/smart-practice', protect, getSmartPracticeSession);
router.get('/:id', getQuestionById);

module.exports = router;

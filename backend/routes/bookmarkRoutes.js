const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  toggleBookmark,
  checkBookmarkStatus,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBookmarks);
router.post('/toggle', protect, toggleBookmark);
router.get('/check', protect, checkBookmarkStatus);

module.exports = router;

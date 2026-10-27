const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getPortalTrends,
} = require('../controllers/analyticsController');

router.get('/public-stats', getPublicStats);
router.get('/portal-trends', getPortalTrends);

module.exports = router;

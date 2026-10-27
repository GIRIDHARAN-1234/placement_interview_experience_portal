const express = require('express');
const router = express.Router();
const {
  getMyEligibility,
  getPlacementOffers,
  createPlacementOffer,
  updatePlacementOfferStatus,
  bulkImportPlacementOffers,
} = require('../controllers/placementOfferController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { placementOfferValidation } = require('../validators/placementValidator');

// Student eligibility endpoint
router.get('/my-eligibility', protect, getMyEligibility);

// Admin endpoints
router.get('/', protect, authorize('admin'), getPlacementOffers);
router.post('/', protect, authorize('admin'), placementOfferValidation, validate, createPlacementOffer);
router.put('/:id/status', protect, authorize('admin'), updatePlacementOfferStatus);
router.post('/bulk', protect, authorize('admin'), bulkImportPlacementOffers);

module.exports = router;

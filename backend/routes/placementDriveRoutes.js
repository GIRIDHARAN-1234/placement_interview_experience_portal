const express = require('express');
const router = express.Router();
const {
  getPlacementDrives,
  getPlacementDriveById,
} = require('../controllers/placementDriveController');

router.get('/', getPlacementDrives);
router.get('/:id', getPlacementDriveById);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  getResourceCategories,
} = require('../controllers/resourceController');

router.get('/', getResources);
router.get('/categories', getResourceCategories);
router.get('/:id', getResourceById);

module.exports = router;

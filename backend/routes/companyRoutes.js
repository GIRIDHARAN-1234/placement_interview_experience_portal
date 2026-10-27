const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyByIdOrSlug,
  getCompanyInsights,
  getCompanyRoadmap,
} = require('../controllers/companyController');

router.get('/', getCompanies);
router.get('/:id', getCompanyByIdOrSlug);
router.get('/:id/insights', getCompanyInsights);
router.get('/:id/roadmap', getCompanyRoadmap);

module.exports = router;

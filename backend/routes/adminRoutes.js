const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getStudents,
  toggleStudentStatus,
  toggleStudentVerification,
  createCompany,
  updateCompany,
  createPlacementDrive,
  updatePlacementDrive,
  getModerationList,
  moderateExperience,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createResource,
  updateResource,
  deleteResource,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { companyValidation } = require('../validators/companyValidator');
const { placementDriveValidation } = require('../validators/placementValidator');
const { questionValidation } = require('../validators/questionValidator');
const { resourceValidation } = require('../validators/resourceValidator');
const { moderationValidation } = require('../validators/experienceValidator');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard metrics
router.get('/dashboard', getDashboardMetrics);

// Student management
router.get('/students', getStudents);
router.put('/students/:id/status', toggleStudentStatus);
router.put('/students/:id/verify', toggleStudentVerification);

// Company management
router.post('/companies', companyValidation, validate, createCompany);
router.put('/companies/:id', updateCompany);

// Placement Drive management
router.post('/placement-drives', placementDriveValidation, validate, createPlacementDrive);
router.put('/placement-drives/:id', updatePlacementDrive);

// Experience Moderation
router.get('/experiences', getModerationList);
router.put('/experiences/:id/moderate', moderationValidation, validate, moderateExperience);

// Question Bank management
router.post('/questions', questionValidation, validate, createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Study Resource management
router.post('/resources', resourceValidation, validate, createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;

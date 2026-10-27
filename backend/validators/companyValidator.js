const { body } = require('express-validator');

const companyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('jobRoles')
    .isArray({ min: 1 })
    .withMessage('At least one job role is required'),
];

module.exports = { companyValidation };

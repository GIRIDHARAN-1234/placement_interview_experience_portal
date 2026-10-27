const { body } = require('express-validator');

const placementDriveValidation = [
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Invalid Company ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Drive title is required'),
  body('driveYear')
    .notEmpty()
    .withMessage('Drive year is required')
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Valid drive year required'),
  body('jobRoles')
    .isArray({ min: 1 })
    .withMessage('At least one job role is required'),
];

const placementOfferValidation = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid Student ID format'),
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Invalid Company ID format'),
  body('placementDriveId')
    .notEmpty()
    .withMessage('Placement Drive ID is required')
    .isMongoId()
    .withMessage('Invalid Placement Drive ID format'),
  body('status')
    .isIn(['selected', 'rejected', 'pending'])
    .withMessage('Offer status must be selected, rejected, or pending'),
];

module.exports = {
  placementDriveValidation,
  placementOfferValidation,
};

const { body } = require('express-validator');

const experienceValidation = [
  body('companyId')
    .notEmpty()
    .withMessage('Company ID is required')
    .isMongoId()
    .withMessage('Invalid Company ID format'),
  body('placementDriveId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Placement Drive ID format'),
  body('selectionOutcome')
    .optional()
    .isIn(['Selected', 'Rejected', 'Waiting'])
    .withMessage('Selection outcome must be Selected, Rejected, or Waiting'),
  body('jobRole')
    .trim()
    .notEmpty()
    .withMessage('Job role is required'),
  body('interviewDate')
    .notEmpty()
    .withMessage('Interview date is required')
    .isISO8601()
    .withMessage('Interview date must be a valid date'),
  body('interviewMode')
    .optional()
    .isIn(['on-campus', 'virtual', 'hybrid'])
    .withMessage('Interview mode must be on-campus, virtual, or hybrid'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('rounds')
    .isArray({ min: 1 })
    .withMessage('At least one interview round must be provided'),
  body('rounds.*.roundName')
    .trim()
    .notEmpty()
    .withMessage('Each round must have a round name'),
  body('rounds.*.description')
    .trim()
    .notEmpty()
    .withMessage('Each round must have a description'),
  body('preparationStrategy')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Preparation strategy must be at least 10 characters'),
];

const moderationValidation = [
  body('status')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be Approved or Rejected'),
  body('moderationFeedback')
    .optional()
    .trim(),
];

module.exports = {
  experienceValidation,
  moderationValidation,
};

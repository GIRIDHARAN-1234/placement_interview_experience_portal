const { body } = require('express-validator');

const questionValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Question title is required'),
  body('questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('companyId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid company ID'),
];

module.exports = { questionValidation };

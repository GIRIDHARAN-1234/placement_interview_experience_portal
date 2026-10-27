const { body } = require('express-validator');

const resourceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Resource title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Resource description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('resourceType')
    .optional()
    .isIn(['article', 'pdf', 'video', 'link', 'guide'])
    .withMessage('Resource type must be article, pdf, video, link, or guide'),
];

module.exports = { resourceValidation };

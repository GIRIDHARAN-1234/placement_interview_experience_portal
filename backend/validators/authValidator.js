const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('College email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('registerNumber')
    .trim()
    .notEmpty()
    .withMessage('Register number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Register number must be between 3 and 20 characters'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('graduationYear')
    .notEmpty()
    .withMessage('Graduation year is required')
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Graduation year must be between 2020 and 2035'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('graduationYear')
    .optional()
    .isInt({ min: 2020, max: 2035 })
    .withMessage('Graduation year must be between 2020 and 2035'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
};

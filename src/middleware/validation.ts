import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ApiError } from './errorHandler';

// Process validation errors
const handleValidationErrors = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for RealWorld API spec
    const formattedErrors: Record<string, string[]> = {};
    
    errors.array().forEach((error: any) => {
      // Get field name from path or location
      const fieldPath = error.path || (error.location ? error.location + '.' + error.param : error.param);
      const field = typeof fieldPath === 'string' ? fieldPath.split('.').pop() || '' : error.param;
      
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    });
    
    throw ApiError.validationError({ errors: formattedErrors });
  }
  
  next();
};

// User registration validation
export const validateUser = [
  body('user.username')
    .notEmpty().withMessage('Username cannot be empty')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
    
  body('user.email')
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email format'),
    
  body('user.password')
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
  handleValidationErrors,
];

// User login validation
export const validateLogin = [
  body('user.email')
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email format'),
    
  body('user.password')
    .notEmpty().withMessage('Password cannot be empty'),
    
  handleValidationErrors,
];

// Article validation
export const validateArticle = [
  body('article.title')
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
    
  body('article.description')
    .notEmpty().withMessage('Description cannot be empty')
    .isLength({ min: 1, max: 255 }).withMessage('Description must be between 1 and 255 characters'),
    
  body('article.body')
    .notEmpty().withMessage('Body cannot be empty'),
    
  body('article.tagList')
    .optional()
    .isArray().withMessage('TagList must be an array'),
    
  handleValidationErrors,
];

// Comment validation
export const validateComment = [
  body('comment.body')
    .notEmpty().withMessage('Comment body cannot be empty')
    .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
    
  handleValidationErrors,
];

// User update validation
export const validateUserUpdate = [
  body('user.email')
    .optional()
    .isEmail().withMessage('Invalid email format'),
    
  body('user.username')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
    
  body('user.password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
  body('user.bio')
    .optional(),
    
  body('user.image')
    .optional()
    .isURL().withMessage('Image must be a valid URL'),
    
  handleValidationErrors,
];

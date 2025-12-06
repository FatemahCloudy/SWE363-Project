import { validationResult, body, param, query } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

export const userValidation = {
    signup: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers, and underscores'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('fullName')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Full name cannot exceed 100 characters'),
        validate
    ],
    login: [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required'),
        validate
    ],
    update: [
        body('fullName')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Full name cannot exceed 100 characters'),
        body('bio')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Bio cannot exceed 500 characters'),
        body('location')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Location cannot exceed 100 characters'),
        validate
    ]
};

export const memoryValidation = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 200 })
            .withMessage('Title cannot exceed 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('category')
            .optional()
            .isIn(['travel', 'family', 'friends', 'food', 'nature', 'adventure', 'culture', 'other'])
            .withMessage('Invalid category'),
        body('privacy')
            .optional()
            .isIn(['public', 'private', 'followers_only'])
            .withMessage('Invalid privacy setting'),
        body('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude must be between -90 and 90'),
        body('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude must be between -180 and 180'),
        validate
    ],
    update: [
        body('title')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Title cannot exceed 200 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description cannot exceed 2000 characters'),
        body('category')
            .optional()
            .isIn(['travel', 'family', 'friends', 'food', 'nature', 'adventure', 'culture', 'other'])
            .withMessage('Invalid category'),
        body('privacy')
            .optional()
            .isIn(['public', 'private', 'followers_only'])
            .withMessage('Invalid privacy setting'),
        validate
    ]
};

export const commentValidation = {
    create: [
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Comment content is required')
            .isLength({ max: 1000 })
            .withMessage('Comment cannot exceed 1000 characters'),
        validate
    ]
};

export const messageValidation = {
    create: [
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Message content is required')
            .isLength({ max: 2000 })
            .withMessage('Message cannot exceed 2000 characters'),
        body('receiverId')
            .notEmpty()
            .withMessage('Receiver ID is required')
            .isMongoId()
            .withMessage('Invalid receiver ID'),
        validate
    ]
};

export const reportValidation = {
    create: [
        body('reason')
            .isIn(['spam', 'harassment', 'inappropriate', 'copyright', 'other'])
            .withMessage('Invalid report reason'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description cannot exceed 1000 characters'),
        validate
    ]
};

export const idValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    validate
];

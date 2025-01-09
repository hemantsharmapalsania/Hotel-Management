const { check, validationResult } = require('express-validator');

exports.validateRegisterSetUp = [
    check('mobile_number')
        .notEmpty()
        .withMessage('Mobile number is required')
        .isMobilePhone()
        .withMessage('Invalid Mobile number format'),

    check('residency_name')
        .optional()
        .isString()
        .withMessage('Residency name must be a string'),

    check('dob')
        .optional()
        .isDate()
        .withMessage('Invalid date format (YYYY-MM-DD required)'),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format'),

    check('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be either admin or user'),

    check('status')
        .optional()
        .isIn([0, 1])
        .withMessage('Invalid status'),

    check('country')
        .optional()
        .isString()
        .withMessage('Country must be a string'),

    check('state')
        .optional()
        .isString()
        .withMessage('State must be a string'),

    check('district')
        .optional()
        .isString()
        .withMessage('District must be a string'),

    check('city')
        .optional()
        .isString()
        .withMessage('City must be a string'),

    check('pin_no')
        .optional()
        .isPostalCode('IN')
        .withMessage('Invalid PIN code format'),

    check('address')
        .optional()
        .isString()
        .withMessage('Address must be a string'),

    check('website')
        .optional()
        .isURL()
        .withMessage('Invalid website URL'),

    check('tin_number')
        .optional()
        .isString()
        .withMessage('TIN number must be a string'),

    check('service_tax_number')
        .optional()
        .isString()
        .withMessage('Service tax number must be a string'),

    check('fax_number')
        .optional()
        .isString()
        .withMessage('Fax number must be a string'),

    check('activation_key')
        .optional()
        .isString()
        .withMessage('Activation key must be a string'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateLoginUser = [
    check('username')
        .notEmpty()
        .withMessage('Username is required')
        .isString()
        .withMessage('Username must be a string'),

    check('phone_number')
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone()
        .withMessage('Invalid phone number format'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

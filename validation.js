const {body} = require('express-validator');



const addForm = [
   
    // Root: menus (array)
  body('menus')
    .isArray({ min: 1 }).withMessage('menus must be a non-empty array'),

  // menus[].id
  body('menus.*.id')
    .isInt({ gt: 0 }).withMessage('menus[].id must be an integer > 0'),

  // menus[].sysName
  body('menus.*.sysName')
    .isString().notEmpty().withMessage('menus[].sysName is required and must be a string'),


 // menus[].name (object)
  body('menus.*.name')
    .custom(val => {
      if (typeof val !== 'object' || !val) {
        throw new Error('menus[].name must be an object with language keys');
      }

      const keys = Object.keys(val);
       for (let key of keys) {
        if (!['en-GB', 'fr-FR'].includes(key)) {
          throw new Error(`menus.*.name contains invalid key "${key}". Allowed: en-GB, fr-FR`);
        }
        }
      const values = Object.values(val);
      if (values.some(v => typeof v !== 'string' || v.trim() === '')) {
        throw new Error('menus[].name values must be non-empty strings');
      }
      return true;
    }),

    body('menus.*.name.en-GB').exists().not().isEmpty().withMessage("required")
    .isString().withMessage("must be string"),
    body('menus.*.name.fr-FR').exists().not().isEmpty().withMessage("required")
    .isString().withMessage("must be string"),

 // menus[].price
  body('menus.*.price')
    .isFloat({ gt: 0 }).withMessage('menus[].price must be a number > 0'),

  // menus[].vatRate
  body('menus.*.vatRate')
    .isIn(['normal', 'reduced', 'none'])
    .withMessage('menus[].vatRate must be one of: normal, reduced, none'),

// Root: vatRates (object)
  body('vatRates')
    .custom(val => {
      if (typeof val !== 'object' || !val) {
        throw new Error('vatRates must be an object');
      }
      const keys = Object.keys(val);
       for (let key of keys) {
          if (!['normal', 'reduced', 'none'].includes(key)) {
            throw new Error(`vatRates contains invalid key "${key}". Allowed: normal, reduced, none`);
          }
        }
      return true;
    }),

  // vatRates.*.ratePct
  body('vatRates.*.ratePct')
    .isFloat({ gt: 0 }).withMessage('vatRates.*.ratePct must be a number > 0'),

  // vatRates.*.isDefault (optional)
  body('vatRates.*.isDefault')
    .optional()
    .isBoolean().withMessage('vatRates.*.isDefault must be boolean'),

];




module.exports = {
    addForm,
}

import { body } from "express-validator";

// Validation rules for POST /products
export const createProductValidation = [
  body("title")
    .exists({ checkFalsy: true })
    .withMessage("title is required")
    .isString()
    .withMessage("title must be a string")
    .trim(),

  body("description")
    .exists({ checkFalsy: true })
    .withMessage("description is required")
    .isString()
    .withMessage("description must be a string")
    .trim(),

  body("price.amount")
    .exists({ checkFalsy: true })
    .withMessage("price.amount is required")
    .isFloat({ min: 0 })
    .withMessage("price.amount must be a number")
    .toFloat(),

  body("price.currency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("price.currency must be either 'USD' or 'INR'"),

  body("category")
    .exists({ checkFalsy: true })
    .withMessage("category is required")
    .isString()
    .withMessage("category must be a string")
    .trim(),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("stock must be a non-negative integer")
    .toInt(),
];

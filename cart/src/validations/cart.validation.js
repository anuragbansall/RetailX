import { body, param } from "express-validator";

export const addToCartValidation = [
  body("productId")
    .exists({ checkFalsy: true })
    .withMessage("productId is required")
    .bail()
    .isMongoId()
    .withMessage("productId must be a valid Mongo ObjectId"),
  body("quantity")
    .exists({ checkFalsy: true })
    .withMessage("quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("quantity must be an integer >= 1")
    .toInt(),
];

export const updateCartItemValidation = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("id param is required")
    .bail()
    .isMongoId()
    .withMessage("id must be a valid Mongo ObjectId"),
  body("quantity")
    .exists({ checkFalsy: true })
    .withMessage("quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("quantity must be an integer >= 1")
    .toInt(),
];

export const deleteCartItemValidation = [
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("id param is required")
    .bail()
    .isMongoId()
    .withMessage("id must be a valid Mongo ObjectId"),
];

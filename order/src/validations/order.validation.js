import { body, param } from "express-validator";

const orderIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Order id must be a valid MongoDB ObjectId"),
];

const shippingAddressValidation = [
  body("address")
    .exists({ checkFalsy: true })
    .withMessage("Address is required")
    .bail()
    .isObject()
    .withMessage("Address must be an object"),
  body("address.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required")
    .isString()
    .withMessage("Street must be a string"),
  body("address.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isString()
    .withMessage("City must be a string"),
  body("address.state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),
  body("address.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),
  body("address.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required")
    .isString()
    .withMessage("Zip code must be a string"),
];

export const createOrderValidation = [];
export const getUsersOrdersValidation = [];
export const getSellerOrdersValidation = [];
export const getOrderByIdValidation = [...orderIdParamValidation];
export const cancelOrderValidation = [...orderIdParamValidation];
export const updateOrderAddressValidation = [
  ...orderIdParamValidation,
  ...shippingAddressValidation,
];

import { body, oneOf, param } from "express-validator";

// Validation rules for POST /auth/register
export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("username must be 3-30 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("username can contain letters, numbers, and underscores only"),

  body("email")
    .isEmail()
    .withMessage("valid email is required")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("password must be a string")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("password must contain at least one special character"),

  body("fullName").custom((value) => {
    if (!value || typeof value !== "object") {
      throw new Error("fullName is required");
    }
    const { firstName, lastName } = value;
    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      throw new Error("firstName is required");
    }
    if (!lastName || typeof lastName !== "string" || !lastName.trim()) {
      throw new Error("lastName is required");
    }
    return true;
  }),

  body("role")
    .optional()
    .isIn(["user", "seller"])
    .withMessage("role must be either 'user' or 'seller'"),

  body("addresses")
    .optional()
    .isArray()
    .withMessage("addresses must be an array"),
  body("addresses")
    .optional()
    .custom((addresses) => {
      if (!Array.isArray(addresses)) return true;
      const defaultCount = addresses.reduce(
        (count, addr) => count + (addr && addr.isDefault === true ? 1 : 0),
        0,
      );
      if (defaultCount > 1) {
        throw new Error("Only one address can be default");
      }
      return true;
    }),
  body("addresses.*.street")
    .optional({ nullable: true })
    .isString()
    .withMessage("street must be a string")
    .trim(),
  body("addresses.*.city")
    .optional({ nullable: true })
    .isString()
    .withMessage("city must be a string")
    .trim(),
  body("addresses.*.state")
    .optional({ nullable: true })
    .isString()
    .withMessage("state must be a string")
    .trim(),
  body("addresses.*.zipCode")
    .optional({ nullable: true })
    .isString()
    .withMessage("zipCode must be a string")
    .trim(),
  body("addresses.*.country")
    .optional({ nullable: true })
    .isString()
    .withMessage("country must be a string")
    .trim(),
  body("addresses.*.isDefault")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

// Validation rules for POST /auth/login
export const loginValidation = [
  // Require either a valid email or a valid username
  oneOf(
    [
      body("email")
        .optional()
        .isEmail()
        .withMessage("valid email is required when provided")
        .normalizeEmail(),
      body("username")
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("username must be 3-30 characters long")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage(
          "username can contain letters, numbers, and underscores only",
        ),
    ],
    "must provide a valid email or username",
  ),

  // Password must be present
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("password is required")
    .isString()
    .withMessage("password must be a string"),

  // Map email/username to identifier for the controller
  body("identifier")
    .customSanitizer((value, { req }) => req.body.email || req.body.username)
    .exists({ checkFalsy: true })
    .withMessage("Username or email is required"),
];

// Validation rules for POST /auth/me/addresses
export const addAddressValidation = [
  body("street")
    .exists({ checkFalsy: true })
    .withMessage("street is required")
    .isString()
    .withMessage("street must be a string")
    .trim(),
  body("city")
    .exists({ checkFalsy: true })
    .withMessage("city is required")
    .isString()
    .withMessage("city must be a string")
    .trim(),
  body("state")
    .exists({ checkFalsy: true })
    .withMessage("state is required")
    .isString()
    .withMessage("state must be a string")
    .trim(),
  body("zipCode")
    .exists({ checkFalsy: true })
    .withMessage("zipCode is required")
    .isString()
    .withMessage("zipCode must be a string")
    .trim(),
  body("country")
    .exists({ checkFalsy: true })
    .withMessage("country is required")
    .isString()
    .withMessage("country must be a string")
    .trim(),
  body("isDefault")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
];

// Validation rules for DELETE /auth/me/addresses/:addressId
export const addressIdParamValidation = [
  param("addressId")
    .exists({ checkFalsy: true })
    .withMessage("addressId is required")
    .isMongoId()
    .withMessage("addressId must be a valid MongoDB ObjectId"),
];

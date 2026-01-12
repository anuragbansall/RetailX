import { body } from "express-validator";

// Validation rules for /auth/register
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
];

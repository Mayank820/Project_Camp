import { body } from "express-validator";

const userRegistrationValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username required")
      .isLength({ min: 5 })
      .withMessage("Minium 5 characters are allowed")
      .isLength({ max: 20 })
      .withMessage("Maximum 20 characters are allowed"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),

    body("fullname").trim().notEmpty().withMessage("Fullname is required"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export { userRegistrationValidator, userLoginValidator };

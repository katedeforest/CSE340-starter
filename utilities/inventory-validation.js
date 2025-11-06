const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const inventoryModel = require("../models/inventory-model");

/*  **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.addClassRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9_-]+$/)
      .withMessage(
        "Please provide a classification with no space or special characters."
      )
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error(
            "Classification exists. Please log in or use different email"
          );
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to home page
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

module.exports = validate;

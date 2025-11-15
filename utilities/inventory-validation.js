const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const inventoryModel = require("../models/inventory-model");

/*  **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.addClassRules = () => {
  return [
    // name is required and must be a string with no spaces or special characters
    body("classification_name")
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

/*  **********************************
 *  Inventory Validation Rules
 * ********************************* */
validate.addInvRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the model."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .isInt({ max: new Date().getFullYear() }) // any year up to the current one
      .withMessage("Please provide a valid 4-digit year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the description."),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .customSanitizer((value) => value.replace(/,/g, "")) // remove commas
      .isNumeric()
      .withMessage("Please provide the price as a number."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .customSanitizer((value) => value.replace(/,/g, "")) // remove commas
      .isNumeric()
      .withMessage("Please provide the miles as a number."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the color."),
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide the color."),
  ];
};

/* ******************************
 * Check data and return errors on add-inventory view or continue to home page
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classificationList,
    });
    return;
  }
  next();
};

/* ******************************
 * Check data and return errors on edit-inventory view or continue to home page
 * ***************************** */
validate.checkEditData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit Inventory",
      nav,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classificationList,
    });
    return;
  }
  next();
};

module.exports = validate;

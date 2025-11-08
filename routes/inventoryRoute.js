// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory item detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// Route to build management view
router.get(
  "/management",
  utilities.handleErrors(invController.buildManagement)
);

// Route to build add classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClass)
);

// Process the add classification attempt
router.post(
  "/add-classification",
  regValidate.addClassRules(),
  regValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInv));

// Process the add classification attempt
router.post(
  "/add-inventory",
  regValidate.addInvRules(),
  regValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;

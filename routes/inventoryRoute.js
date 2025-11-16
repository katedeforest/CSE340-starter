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

// Process the add inventory attempt
router.post(
  "/add-inventory",
  regValidate.addInvRules(),
  regValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

// build mangement view's classification table
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// editing iventory item from management view
router.get(
  "/edit-inventory/:inventory_id",
  utilities.handleErrors(invController.buildEditInventory)
);

// update inventory item (submit button from edit inventory view)
router.post(
  "/edit-inventory/",
  regValidate.addInvRules(),
  regValidate.checkEditData,
  utilities.handleErrors(invController.editInventory)
);

// deleting iventory item from management view
router.get(
  "/delete-inventory/:inventory_id",
  utilities.handleErrors(invController.buildDeleteInventory)
);

// delete inventory item (submit button from delete inventory view)
router.post(
  "/delete-inventory/",
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;

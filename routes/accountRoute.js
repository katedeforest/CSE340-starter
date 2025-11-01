// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController.js");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login attempt
router.post("/login", (req, res) => {
  res.status(200).send("login process");
});

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Process the registration attempt
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Export routes
module.exports = router;

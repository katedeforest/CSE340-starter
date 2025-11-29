// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController.js");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Process the logout attempt
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

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

// Route to build account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

// Route to build account update view
router.get(
  "/update-account",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process the Update Account attempt
router.post(
  "/update-account-info",
  regValidate.updateInfoRules(),
  regValidate.checkUpdateInfoData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Process the Change Password attempt
router.post(
  "/update-account-pass",
  regValidate.updatePassRules(),
  regValidate.checkUpdatePassData,
  utilities.handleErrors(accountController.updateAccountPass)
);

// Export routes
module.exports = router;

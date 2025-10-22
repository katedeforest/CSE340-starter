// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController.js");
const utilities = require("../utilities/");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Export routes
module.exports = router;

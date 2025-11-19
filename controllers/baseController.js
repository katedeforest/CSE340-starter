const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  const headerLink = await utilities.getHeaderLinks(req, res);
  res.render("index", { title: "Home", nav, headerLink });
};

module.exports = baseController;

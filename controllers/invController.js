const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const data = await invModel.getItemByInvId(inv_id);
  const item = data[0];
  const grid = await utilities.buildInventoryItemGrid(item);
  let nav = await utilities.getNav();
  const itemMake = item.inv_make;
  const itemModel = item.inv_model;
  res.render("./inventory/detail", {
    title: itemMake + " " + itemModel,
    nav,
    grid,
  });
};

/* ***************************
 *  Deliver Management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const grid = await utilities.buildManagementGrid();
  res.render("./inventory/management", {
    title: "Manage Data",
    nav,
    grid,
    errors: null,
  });
};

module.exports = invCont;

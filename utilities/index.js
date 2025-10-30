const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li class="card">';
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr class="divider"/>';
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        '<span class="sale-price">$' +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the item view HTML
 * ************************************ */
Util.buildInventoryItemGrid = async function (data) {
  let grid = "";
  if (data) {
    grid =
      '<div class="item"><img src="' +
      data.inv_image +
      '" alt="Image of ' +
      data.inv_make +
      " " +
      data.inv_model +
      '" class="item__img" />';
    grid +=
      '<p class="item__name">' + data.inv_make + " " + data.inv_model + "</p>";
    grid +=
      '<span class="item__price">Price: $' +
      new Intl.NumberFormat("en-US").format(data.inv_price) +
      "</span>";
    grid +=
      '<div class="item__infobox"> <p class="item__infobox-year"> Year: ' +
      data.inv_year +
      "</p>";
    grid +=
      '<p class="item__infobox-miles"> Miles: ' +
      new Intl.NumberFormat("en-US", { style: "decimal" }).format(
        data.inv_miles
      ) +
      "</p>";
    grid +=
      '<p class="item__infobox-color"> Color: ' + data.inv_color + "</p> ";
    grid +=
      '<p class="item__infobox-descrip">' +
      data.inv_description +
      "</p></div></div>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the management view HTML
 * ************************************ */
Util.buildManagementGrid = async function () {
  let grid = '<div class="manage-data">';

  grid += '<div class="manage-data__card">';
  grid += '<h2 class="add--title">Classification</h2>';
  grid +=
    '<a href="inv/management/addClassification" class="add--button">Add new Classification</a>';
  grid += "</div>";

  grid += '<div class="manage-data__card">';
  grid += '<h2 class="add--title">Inventory</h2>';
  grid +=
    '<a href="inv/management/addInventory" class="add--button">Add new Inventory Item</a>';
  grid += "</div>";

  grid += "</div>";
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;

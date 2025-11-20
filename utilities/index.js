const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    '<a href="add-classification" class="add--button">Add new Classification</a>';
  grid += "</div>";

  grid += '<div class="manage-data__card">';
  grid += '<h2 class="add--title">Inventory</h2>';
  grid +=
    '<a href="add-inventory" class="add--button">Add new Inventory Item</a>';
  grid += "</div>";

  grid += "</div>";
  return grid;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classification_id" class="input" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Account Type
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "Please log in.");
      return res.redirect("/account/login");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const account_type = decoded.account_type;
    if (account_type === "Employee" || account_type === "Admin") {
      return next();
    } else {
      req.flash(
        "notice",
        "Please log in as an employee or administrator to access that page."
      );
      return res.redirect("/account/login");
    }
  } catch (err) {
    req.flash("notice", "Session expired. Please log in again.");
    return res.redirect("/account/login");
  }
};

/* ************************
 * Constructs the header login and management links
 ************************** */
Util.getHeaderLinks = async function (req, res, next) {
  let headerLink = "";
  const account_firstname = res?.locals?.accountData?.account_firstname;

  if (res.locals.loggedin) {
    // Visible only when logged in
    headerLink +=
      `
      <a title="Go to your account management" href="/account" class="headerLink--loggedIn">Welcome ` +
      account_firstname +
      `</a>
      <a title="Log out of your account" href="/account/logout" class="headerLink--loggedIn">Logout</a>
    `;
  } else {
    // Visible only when logged out
    headerLink +=
      '<a title="Click to log in" href="/account/login" class="headerLink--loggedOut">Login</a>';
  }
  return headerLink;
};

/* ************************
 * Constructs the account management content
 ************************** */
Util.getAccountContent = async function (req, res, next) {
  let accountContent = "";
  const account_firstname = res?.locals?.accountData?.account_firstname;

  try {
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "Please log in.");
      return res.redirect("/account/login");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const account_type = decoded.account_type;

    // for all accounts
    accountContent += `<h2>Welcome ` + account_firstname + `</h2>`;
    accountContent += `<div><h3>Update Account Information</h3>`;
    accountContent += `<p><a href="/account/update-account">Click here to update your account information.</a></p></div>`;

    if (account_type === "Employee" || account_type === "Admin") {
      // add for Employee or Admin account
      accountContent += `<div><h3>Inventory Management</h3>`;
      accountContent += `<p><a href="/inv/management">Click here to go to the inventory management page.</a></p></div>`;
    }
  } catch (err) {
    req.flash("notice", "Session expired. Please log in again.");
    return res.redirect("/account/login");
  }
  return accountContent;
};

module.exports = Util;

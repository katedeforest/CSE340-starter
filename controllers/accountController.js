const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  res.render("account/login", {
    title: "Login",
    nav,
    headerLink,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  res.render("account/register", {
    title: "Register",
    nav,
    headerLink,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      headerLink,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      headerLink,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      headerLink,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      headerLink,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        headerLink,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Build account view
 * ************************************ */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  let accountContent = await utilities.getAccountContent(req, res);
  res.render("account/management", {
    title: "Account",
    nav,
    headerLink,
    accountContent,
    errors: null,
  });
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  // Clear the JWT cookie
  res.clearCookie("jwt");

  // Optional: flash message
  req.flash("notice", "You have been logged out.");

  // Redirect to home page
  return res.redirect("/");
}

/* ***************************
 *  Deliver Update Account view
 * ************************** */
async function buildUpdateAccount(req, res, next) {
  const account_id = res.locals.accountData.account_id;
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);

  const data = await accountModel.getAccountById(account_id);
  const itemData = data[0];

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    headerLink,
    errors: null,
    account_firstname: itemData.account_firstname,
    account_lastname: itemData.account_lastname,
    account_email: itemData.account_email,
    account_password: itemData.account_password,
    account_id: itemData.account_id,
  });
}

/* ****************************************
 *  Process Account Information Update
 * *************************************** */
async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  // Fetch current account data before update
  const currentDataArray = await accountModel.getAccountById(account_id);
  const currentData = currentDataArray[0];

  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  // Fetch updated account data
  const updatedDataArray = await accountModel.getAccountById(account_id);
  const updatedData = updatedDataArray[0];

  if (updateResult) {
    // Build a list of fields that were actually updated
    const updatedFields = [];
    if (currentData.account_firstname !== account_firstname)
      updatedFields.push("First Name");
    if (currentData.account_lastname !== account_lastname)
      updatedFields.push("Last Name");
    if (currentData.account_email !== account_email)
      updatedFields.push("Email");

    const fieldsMessage = updatedFields.length
      ? updatedFields.join(", ")
      : "account information"; // fallback if nothing changed

    req.flash(
      "notice",
      `Congratulations, your (${fieldsMessage}) has been updated, ${updatedData.account_firstname}.`
    );

    // Get account content for management view
    const accountContent = await utilities.getAccountContent(req, res);

    // Render management view with updated data
    return res.status(200).render("account/management", {
      title: "Account",
      nav,
      headerLink,
      accountContent,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      headerLink,
      errors: null,
      account_firstname: currentData.account_firstname,
      account_lastname: currentData.account_lastname,
      account_email: currentData.account_email,
      account_password: currentData.account_password,
      account_id: currentData.account_id,
    });
  }
}

/* ****************************************
 *  Process Account Password Update
 * *************************************** */
async function updateAccountPass(req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const { account_password, account_id } = req.body;

  const data = await accountModel.getAccountById(account_id);
  const itemData = data[0];

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the update.");
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav,
      headerLink,
      errors: null,
      account_firstname: itemData.account_firstname,
      account_lastname: itemData.account_lastname,
      account_email: itemData.account_email,
      account_password: itemData.account_password,
      account_id: itemData.account_id,
    });
  }

  const regResult = await accountModel.updateAccountPass(
    hashedPassword,
    account_id
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve changed your password, ${itemData.account_firstname}.`
    );

    // Get account content for management view
    const accountContent = await utilities.getAccountContent(req, res);

    // Render management view with updated data
    return res.status(200).render("account/management", {
      title: "Account",
      nav,
      headerLink,
      accountContent,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the password change failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      headerLink,
      errors: null,
      account_firstname: itemData.account_firstname,
      account_lastname: itemData.account_lastname,
      account_email: itemData.account_email,
      account_password: itemData.account_password,
      account_id: itemData.account_id,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  accountLogout,
  buildUpdateAccount,
  updateAccountInfo,
  updateAccountPass,
};

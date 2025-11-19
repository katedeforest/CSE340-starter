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
  let headerLink = await utilities.getHeaderLinks(req, res);
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " Vehicles",
    nav,
    headerLink,
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
  let headerLink = await utilities.getHeaderLinks(req, res);
  const itemMake = item.inv_make;
  const itemModel = item.inv_model;
  res.render("./inventory/detail", {
    title: itemMake + " " + itemModel,
    nav,
    headerLink,
    grid,
  });
};

/* ***************************
 *  Deliver Management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const classificationList = await utilities.buildClassificationList();
  const grid = await utilities.buildManagementGrid();
  res.render("./inventory/management", {
    title: "Manage Data",
    nav,
    headerLink,
    classificationList,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Deliver Add Classification view
 * ************************** */
invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    headerLink,
    errors: null,
  });
};

/* ****************************************
 *  Process Add Classification
 * *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const { classification_name } = req.body;
  const grid = await utilities.buildManagementGrid();

  // use the inventory model's addClassification function
  const addClassResult = await invModel.addClassification(classification_name);

  if (addClassResult) {
    req.flash(
      "notice",
      `Congratulations, ${classification_name} has been added to your classifications.`
    );
    res.status(201).render("inventory/management", {
      title: "Manage Data",
      nav,
      headerLink,
      grid,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, adding the classification failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      headerLink,
      errors: null,
    });
  }
};

/* ***************************
 *  Deliver Add Inventory view
 * ************************** */
invCont.buildAddInv = async function (req, res, next) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    headerLink,
    classificationList,
    errors: null,
  });
};

/* ****************************************
 *  Process Add Inventory
 * *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const inv_image = "/images/vehicles/no-image.png";
  const inv_thumbnail = "/images/vehicles/no-image-tn.png";
  const grid = await utilities.buildManagementGrid();

  // use the inventory model's addInventory function
  const addInvResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (addInvResult) {
    req.flash(
      "notice",
      `Congratulations, ${inv_make} ${inv_model} has been added to your inventory.`
    );
    res.status(201).render("inventory/management", {
      title: "Manage Data",
      nav,
      headerLink,
      grid,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, adding the inventory item failed.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      headerLink,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Deliver Edit Inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id);
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);

  // const itemData = await invModel.getInventoryById(inv_id);
  const data = await invModel.getItemByInvId(inv_id);
  const itemData = data[0];

  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    headerLink,
    classificationList: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ****************************************
 *  Process Edit Inventory
 * *************************************** */
invCont.editInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const inv_image = "/images/vehicles/no-image.png";
  const inv_thumbnail = "/images/vehicles/no-image-tn.png";

  // use the inventory model's addInventory function
  const editInvResult = await invModel.editInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (editInvResult) {
    req.flash(
      "notice",
      `Congratulations, ${inv_make} ${inv_model} was successfully edited.`
    );
    res.redirect("/inv/management");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the edit failed.");
    res.status(501).render("inventory/edit-inventory/:inventory_id", {
      title: "Edit " + itemName,
      nav,
      headerLink,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Deliver Delete Inventory view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inventory_id);
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);

  const data = await invModel.getItemByInvId(inv_id);
  const itemData = data[0];

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    headerLink,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ****************************************
 *  Process Delete Inventory
 * *************************************** */
invCont.deleteInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let headerLink = await utilities.getHeaderLinks(req, res);
  const { inv_id, inv_make, inv_model } = req.body;

  // use the inventory model's addInventory function
  const deleteInvResult = await invModel.deleteInventory(inv_id);

  if (deleteInvResult) {
    req.flash(
      "notice",
      `Congratulations, ${inv_make} ${inv_model} was successfully deleted.`
    );
    res.redirect("/inv/management");
  } else {
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the deletion failed.");
    res.status(501).render("inventory/delete-inventory/:inventory_id", {
      title: "Edit " + itemName,
      nav,
      headerLink,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont;

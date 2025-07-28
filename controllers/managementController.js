const utilities = require("../utilities")
const invModel = require("../models/inventory-model")
 
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Management",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver add new classification view
* *************************************** */
async function addNewClassification(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver add to inventory view
* *************************************** */

async function addNewInventoryItem(req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationSelect,
    // You can pass these to make the form sticky:
    inv_make: "",
    inv_model: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image.png",
    inv_price: "",
    inv_miles: "",
    inv_color: ""
  })
}

async function registerClassification(req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const regResult = await invModel.registerClassification(classification_name)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you have added the classification ${classification_name}`
    )
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-classification", {
      title: "add-classification",
      nav,
    })
  }
  //console.log(regResult)
}

async function registerInventoryItem(req, res){
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

  const regResult = await invModel.registerInventoryItem( inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id )

    if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you have added the inventory item ${inv_make}`
    )
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-classification", {
      title: "add-classification",
      nav,
    })
  }
}

module.exports = {buildManagement, addNewClassification, addNewInventoryItem, registerClassification, registerInventoryItem};
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildManagement = async function(req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList() // no param
  res.render("./inventory/management", {
    title: "Management",
    nav,
    classificationSelect,
    errors: null
  })
}



 invCont.addNewClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

 invCont.addNewInventoryItem = async function(req, res) {
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

invCont.registerClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const classificationSelect = await utilities.buildClassificationList()
  const regResult = await invModel.registerClassification(classification_name)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you have added the classification ${classification_name}`
    )
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "add-classification",
      nav,
    })
  }
  //console.log(regResult)
}

 invCont.registerInventoryItem = async function(req, res){
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body
  const classificationSelect = await utilities.buildClassificationList()
  const regResult = await invModel.registerInventoryItem( inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id )

    if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you have added the inventory item ${inv_make}`
    )
    res.status(201).render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "add-classification",
      nav,
    })
  }
}

invCont.buildDetailView = async function(req, res, next){
  const inv_id = req.params.inv_id  // Changed from classificationId to inv_id
  const data = await invModel.getDetail(inv_id)  // Get single item by ID
  
  if (data) {
    const detailHTML = await utilities.getDetail(data)  // Build detail view HTML
    let nav = await utilities.getNav()  // Get navigation
    const itemTitle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`  // Create title
    
      res.render("./inventory/detail", {
        title: itemTitle,
        nav,
        detailHTML  // Pass the HTML from utilities
      })
  } else {
    // Handle case where item not found
    res.status(404).render("./errors/404", {
      title: "Vehicle Not Found",
      nav: await utilities.getNav()
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classificationId);
    console.log("Requested classification ID:", classification_id);

    const invData = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Data from DB:", invData);

    if (invData && invData.length > 0) {
      return res.json(invData); // send the array directly
    } else {
      console.warn("No inventory data found for ID", classification_id);
      return res.status(404).json({ error: "No inventory data found." });
    }
  } catch (err) {
    console.error("Error in getInventoryJSON:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
};

invCont.editInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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
    classification_id: itemData.classification_id
  })
}

 invCont.updateInventory = async function(req, res) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inv/edit-inventory", {
    title: "Edit " + itemName,
    nav,
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
    classification_id
    })
  }
}

invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirmation", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    classification_id: itemData.classification_id
  })
}

invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  let nav = await utilities.getNav()

  const result = await invModel.deleteInventoryItem(inv_id)

  if (result.rowCount > 0) {
    req.flash("notice", "Vehicle was successfully deleted.")
    res.redirect("/inv/management")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

invCont.buildDeleteClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList() // no param
  res.render("./inventory/delete-classification", {
    title: "Classification Delete",
    nav,
    classificationSelect,
    errors: null
  })
}

invCont.deleteClassification = async function (req, res, next){
  const classificationId = req.body.classification_id;

  // Optional: fetch the name for a confirmation message
  const classification = await invModel.getClassificationById(classificationId);

  await invModel.deleteClassification(classificationId);

  req.flash("success", `Classification deleted successfully`);
  res.redirect("/inv/management");
}

 module.exports = invCont
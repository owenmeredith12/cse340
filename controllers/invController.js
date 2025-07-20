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

 module.exports = invCont
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const invModel = require("../models/inventory-model")
  const validate = {}

validate.checkUpdateData = async (req, res, next) => {
  const {
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
  } = req.body;

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.render("inv/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      errors,
      classificationSelect,
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
    });
    return;
  }

  next();
};

validate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a make.")
      .isLength({ min: 2 })
      .withMessage("Make must be at least 2 characters."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a model.")
      .isLength({ min: 1 })
      .withMessage("Model must be at least 1 character."),

    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide a year.")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be between 1900 and 2099."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),

    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a price.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide the number of miles.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative whole number."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color.")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Color can only contain letters and spaces."),

    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification.")
  ]
}

//   validate.checkRegData = async (req, res, next) => {
//     const { account_firstname, account_lastname, account_email } = req.body
//     let errors = []
//     errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       let nav = await utilities.getNav()
//       res.render("account/register", {
//         errors,
//         title: "Registration",
//         nav,
//         account_firstname,
//         account_lastname,
//         account_email,
//       })
//       return
//     }
//     next()
  //}

  module.exports = validate
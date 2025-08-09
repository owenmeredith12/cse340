// Needed Resources 
const utilities = require("../utilities")
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const accountValidation = require("../utilities/inventory-validation")
const checkAccountRole = require("../utilities/checkAccountType")
const invCont = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildDetailView);

router.get("/management", checkAccountRole(["Admin", "Employee"]), invController.buildManagement);
router.get("/add-classification", checkAccountRole(["Admin", "Employee"]),invController.addNewClassification);
router.get("/add-inventory", checkAccountRole(["Admin", "Employee"]), invController.addNewInventoryItem);

router.get("/delete-classification", checkAccountRole(["Admin","Employee"]), invController.buildDeleteClassification);
router.get("/getInventory/:classificationId", utilities.handleErrors(invController.getInventoryJSON))

router.get(
  "/edit-inventory/:inv_id",
  utilities.handleErrors(invController.editInventory)
);

router.get(
  "/delete-confirmation/:inv_id",
  utilities.handleErrors(invController.buildDeleteView)
);

router.post(
    "/update/",
    checkAccountRole(["Admin","Employee"]),
    accountValidation.newInventoryRules(),
    accountValidation.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

router.post(
    "/delete-confirmation/",
    utilities.handleErrors(invController.deleteInventoryItem)
)

router.post(
  "/add-classification",
  utilities.handleErrors(invController.registerClassification)
)

router.post(
    "/add-inventory",
    utilities.handleErrors(invController.registerInventoryItem)
)

router.post(
  "/delete-classification",
  checkAccountRole(["Admin","Employee"]),
  utilities.handleErrors(invController.deleteClassification)
)


module.exports = router;
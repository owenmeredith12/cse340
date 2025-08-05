const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")




router.get("/login", accountController.buildLogin);
router.get("/logout", accountController.logout)

router.get("/register", accountController.buildRegister);
router.get("/logged-in", accountController.buildLoggedInView);
router.get("/management", accountController.buildManagementView)
router.get("/update/:account_id", utilities.checkLogin, accountController.buildUpdateAccount);


router.post('/register', utilities.handleErrors(accountController.registerAccount))

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  // regValidate.loginRules(),
  // regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post(
  "/update-info",
  regValidate.checkRegData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/update-password",
  regValidate.checkRegData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;
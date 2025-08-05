/* ****************************************
*  Deliver login view
* *************************************** */

const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { buildCheckFunction } = require("express-validator")
require("dotenv").config()

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
  console.log(regResult)
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.session.loggedin = true
      req.session.accountData = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type
}

      return res.redirect("/account/logged-in")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildLoggedInView(req, res, next) {
  let nav = await utilities.getNav()
    res.render("account/logged-in", {
    title: "Logged-In",
    nav,
    errors:null
  })
}

async function buildManagementView(req, res, next) {
  let nav = await utilities.getNav()
    res.render("account/management", {
    title: "Account Management",
    nav,
    account_firstname: req.session.accountData.account_firstname,
    account_id: req.session.accountData.account_id,
    account_type:req.session.accountData.account_type,
    errors:null
  })
}

async function buildUpdateAccount(req, res, next) {
  const account_id = req.session.accountData.account_id;
  const account = await accountModel.getAccountById(account_id); // you may need to create this model
  const nav = await utilities.getNav();

  res.render("account/update", {
    title: "Update Account",
    nav,
    account,
    account_id
  });
}

async function logout (req, res) {
res.clearCookie("jwt",{
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
})

  req.session.destroy(function (err) {
    if (err) {
      console.log("Logout error:", err)
      return res.status(500).redirect("/")
    } else {
      res.clearCookie("sessionId")
      return res.redirect("/")
    }
  })

}

async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body;

  try {
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    );

    if (updateResult && updateResult.rowCount > 0) {
      // Update session with new account info
      req.session.accountData.account_firstname = account_firstname;
      req.session.accountData.account_lastname = account_lastname;
      req.session.accountData.account_email = account_email;
      req.session.accountData.account_id = account_id;

      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/management");
    } else {
      req.flash("notice", "Account update failed.");
      return res.status(501).render("account/update", {
        title: "Update Account",
        nav,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        errors: null
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    req.flash("notice", "An error occurred during account update.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      errors: null
    });
  }
}

async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const {
    account_password,
    account_id
  } = req.body;

  let hashedPassword
  hashedPassword = await bcrypt.hashSync(account_password, 10)
  try {
    const updateResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
    );

    if (updateResult && updateResult.rowCount > 0) {
      // Update session with new account info
      req.session.accountData.account_password = account_password;
      req.session.accountData.account_id = account_id;

      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/management");
    } else {
      req.flash("notice", "Account update failed.");
      return res.status(501).render("account/update", {
        title: "Update Account",
        nav,
        account_password,
        account_id,
        errors: null
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    req.flash("notice", "An error occurred during account update.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      account_password,
      account_id,
      errors: null
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin,  buildLoggedInView, logout, buildManagementView, buildUpdateAccount, updateAccount, updatePassword }
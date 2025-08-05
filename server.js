/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoutes")
const accountRoute = require("./routes/accountRoute")
//const managementRoute = require("./routes/managementRoute")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const utilities = require("./utilities")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
app.use(cookieParser())
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(
  session({
    secret: "yourSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set secure: true if using HTTPS
  })
);

app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false
  res.locals.accountData = req.session.accountData || null
  next()
})

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * View engine and templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

//index route
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
//app.use("/inventory", managementRoute)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


app.use(utilities.checkJWTToken)

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();

  // Log the error
  console.error(`\n[ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Determine message
  const status = err.status || 500;
  const message = status === 404
    ? err.message
    : 'Oh no! There was a crash. Maybe try a different route?';

  // Render error view
  res.status(status).render("errors/error", {
    title: status,
    message,
    nav,
    error: process.env.NODE_ENV === "development" ? err : null
  });
});


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

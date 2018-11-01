const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var projectConfiguration = db.projectConfiguration


module.exports = function (app) {
  app.post("/api/createERC721Contract", checkSecret, coinNameExist, impl.createERC721Contract);
  app.post("/api/createERC20Contract", checkSecret, coinNameExist, impl.createERC20Contract);
  app.post("/api/createERC223Contract", checkSecret, coinNameExist, impl.createERC223Contract);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

function checkSecret(req, res, next) {
  return next();
}

function coinNameExist(req, res, next) {
  if (req.body.token_symbol == "XDC" || req.body.token_symbol == "XDCE") {
    console.log("exist");
    req.flash('project_flash', "Token Name Already Exist! Please Try Different Name.");
    res.redirect('/customContract');
  } else {
    projectConfiguration.find({
      where: {
        'coinSymbol': req.body.token_symbol
      }
    }).then(result => {
      // console.log(result)
      if (result == null) {
        console.log("next");
        return next();
      } else {
        res.send({ error: "SMC01", message: "coin name already exist" })
        // console.log("exist");
        // req.flash('project_flash', "Token Name Already Exist! Please Try Different Name.");
        // res.redirect('/customContract');
      }
    })
  }
}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  console.log("Here");
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(async result => {
    result.attemptsCount = result.attemptsCount + 1;
    await result.save().then(console.log("attmpt added", result.package1));
    if (result.package1 > 0) {
      return next();
    } else {
      req.flash('package_flash', "You need to buy Package 1 by contributing 1200000 XDCe");
      res.redirect('/generatedContract');
    }
  });
}

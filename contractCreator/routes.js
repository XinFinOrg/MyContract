const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var projectConfiguration = db.projectConfiguration;

var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');

module.exports = function (app) {
  app.post("/api/createERC721Contract",isLoggedIn, checkSecret, coinNameExist, impl.createERC721Contract);
  app.post("/api/createERC20Contract", isLoggedIn,checkSecret, coinNameExist, impl.createERC20Contract);
  app.post("/api/createERC223Contract",isLoggedIn, checkSecret, coinNameExist, impl.createERC223Contract);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function(err, decoded) {
    if (err) {
      return res.redirect('/');
    } else {
      client.find({
        where: {
          uniqueId: decoded.userId
        }
      }).then(user => {
        req.user = user;
        next();
      });
    }
  });

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

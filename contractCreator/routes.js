const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var projectConfiguration = db.projectConfiguration;

var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');

module.exports = function (app) {
  app.post("/v1/smartcontract/ERC721", isLoggedIn, checkSecret, coinNameExist, hasPackage1, impl.createERC721Contract);
  app.post("/v1/smartcontract/ERC20", isLoggedIn, checkSecret, coinNameExist, hasPackage1, impl.createERC20Contract);
  app.post("/v1/smartcontract/ERC223", isLoggedIn, checkSecret, coinNameExist, hasPackage1, impl.createERC223Contract);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" })
    } else {
      client.find({
        where: {
          uniqueId: decoded.userId
        }
      }).then(user => {
        console.log("here 1")
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
  if (req.body.tokenSymbol == "XDC" || req.body.tokenSymbol == "XDCE") {
    res.send({ status: false, message: "coin name already exist" })
  } else {
    projectConfiguration.find({
      where: {
        'coinSymbol': req.body.tokenSymbol
      }
    }).then(result => {
      if (result == null) {
        console.log("here 2")
        return next();
      } else {
        res.send({ status: false, message: "coin name already exist" })
      }
    })
  }
}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(async result => {
    result.attemptsCount = result.attemptsCount + 1;
    await result.save().then(console.log("attmpt added", result.package1));
    if (result.package1 > 0) {
      console.log("here 3")
      return next();
    } else {
      res.send({ status: false, message: "Package 1 required" })
    }
  });
}

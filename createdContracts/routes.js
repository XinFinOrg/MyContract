const impl = require("./impl");
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var ProjectConfiguration = db.projectConfiguration;

module.exports = function (app) {
    app.post('/v1/smartcontract/contracts', isLoggedIn, checkSecret, impl.getContracts);
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
          req.user = user;
          next();
        });
      }
    });
  
  }
  
  function checkSecret(req, res, next) {
    return next();
  }
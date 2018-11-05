const impl = require("./impl");
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var ProjectConfiguration = db.projectConfiguration;



module.exports = function (app) {
  app.post('/api/automaticDeployer', isLoggedIn, checkSecret, impl.getAutomaticDeployer);
  app.post('/api/contractCompiler', isLoggedIn, checkSecret, impl.contractCompiler);

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

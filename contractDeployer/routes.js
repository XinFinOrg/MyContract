const impl = require("./impl");
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;



module.exports = function (app) {
  app.post('/api/automaticDeployer', isLoggedIn, checkSecret, impl.getAutomaticDeployer);
  app.post('/api/contractCompiler', isLoggedIn, checkSecret, impl.contractCompiler);

}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  // if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

function checkSecret(req, res, next) {
  return next();
}

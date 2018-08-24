const impl = require("./impl");
var path = require('path');
var Client = require('../database/config');


module.exports = function(app, express) {
  app.use(express.static(path.join(__dirname, './dist')));
  app.get('/deployer', hasPackage2, impl.getDeployer);
  app.get('/getBytecode',impl.getBytecode);
  app.post('/saveDeploymentData',impl.saveDeploymentData);
}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

// route middleware to check package 2
function hasPackage2(req, res, next) {
  if (req.user.package2 == true) {
    return next();
  } else {
    req.flash('package_flash', 'You need to buy Package 2');
    res.redirect('/profile');
  }
}

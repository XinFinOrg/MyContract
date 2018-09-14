const impl = require("./impl");
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;



module.exports = function (app, express) {
  app.use(express.static(path.join(__dirname, './dist')));
  app.get('/deployer', isLoggedIn, hasPackage1, impl.getDeployer);
  app.get('/getBytecode', isLoggedIn, impl.getBytecode);
  app.post('/saveDeploymentData', isLoggedIn, impl.saveDeploymentData);
}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  console.log("Here");
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(result => {
    if (result.package1 > 0) {
      return next();
    } else {
      req.flash('package_flash', 'You need to buy Package 1');
      res.redirect('/profile');
    }
  });
}

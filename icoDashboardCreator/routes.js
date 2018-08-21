const impl = require("./impl");

module.exports = function(app) {
  app.get('/icoDashboardSetup', isLoggedIn, hasPackage3, impl.icoDashboardSetup);
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
function hasPackage3(req, res, next) {
  if (req.user.packages.package_3 == true) {
    return next();
  } else {
    req.flash('package_flash', 'You need to buy Package 3');
    res.redirect('/profile');
  }
}

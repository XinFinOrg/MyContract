const impl = require("./impl");

module.exports = function(app) {
  app.get('/icoDashboardSetup',hasPackage3, impl.icoDashboardSetup);
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

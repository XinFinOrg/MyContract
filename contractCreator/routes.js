const impl = require("./impl");

module.exports = function(app) {

  app.get('/customContract', hasPackage1, impl.getCustomContractForm);
  app.get('/recommendedContract', hasPackage1, impl.getRecommendedContractForm);
  app.get('/generatedContract', hasPackage1, impl.getGeneratedContract);
  app.post("/createContract", impl.createContract);
}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  if (req.user.packages.package_1 == true) {
    return next();
  } else {
    req.flash('package_flash', 'You need to buy Package 1');
    res.redirect('/profile');
  }
}

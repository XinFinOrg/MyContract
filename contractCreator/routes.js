const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;


module.exports = function(app) {

  app.get('/customContract', isLoggedIn, impl.getCustomContractForm);
  app.get('/generatedContract', isLoggedIn, impl.getGeneratedContract);
  app.post("/createContract", isLoggedIn, hasPackage1, impl.createContract);
  app.get('/api/checkPackage', isLoggedIn, impl.checkPackage);
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
      req.flash('package_flash', "You need to buy Package 1 by contributing 1200000 XDCe");
      res.redirect('/customContract');
    }
  });
}

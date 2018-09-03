const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;


module.exports = function (app) {

  app.get('/customContract', isLoggedIn, hasPackage1, impl.getCustomContractForm);
  app.get('/generatedContract', isLoggedIn, impl.getGeneratedContract);
  app.post("/createContract", isLoggedIn, impl.createContract);
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
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(result => {
    console.log(result.dataValues,"hello" );
    if (result.dataValues.package_id == 1 || result.dataValues.package_id == 2 || result.dataValues.package_id == 3) {
      return next();
    } else {
      req.flash('package_flash', 'You need to buy Package 1');
      res.redirect('/profile');
    }
  })
}

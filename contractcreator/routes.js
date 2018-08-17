const impl = require("./impl");

module.exports = function(app) {

  app.get('/customContract', hasPackage1, function(req, res) {
    res.render('customContract', {
      user: req.session.user
    });
  });

  app.get('/recommendedContract', hasPackage1, function(req, res) {
    res.render('recommendedContract', {
      user: req.session.user
    });
  });

  app.post("/createContract", hasPackage1, impl.createContract);

}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  if (req.user.packages.package_1 == true) {
    return next();
  } else {
    res.redirect('/profile');
  }
}

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

  app.get('/deployedContract', hasPackage1, function(req, res) {
    // console.log(req.session.contract);
    res.render('deployedContract', {
      user: req.session.user,
      contract: req.session.contract,
      byteCode: req.session.byteCode
    });
  });

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

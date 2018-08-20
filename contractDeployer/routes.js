const impl = require("./impl");
var path = require('path');

module.exports = function(app, express) {
  app.use(express.static(path.join(__dirname, './dist')));
  app.get('/deployer', hasPackage2, function(req, res) {
    console.log("log", req.session.byteCode, req.session.user);
    res.sendFile(path.join(__dirname, './', 'dist', 'index.html'), {
      user: req.session.user,
      byteCode: req.session.byteCode
    });
  });

  app.get('/getBytecode',impl.getBytecode);
}

// route middleware to check package 1
function hasPackage2(req, res, next) {
  if (req.user.packages.package_2 == true) {
    return next();
  } else {
    req.flash('package_flash', 'You need to buy Package 2');
    res.redirect('/profile');
  }
}

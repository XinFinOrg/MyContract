const impl = require("./impl");

module.exports = function(app, sequelize, DataTypes) {
  app.get('/icoDashboardSetup/client/:clientEmail', isLoggedIn, hasPackage3, impl.icoDashboardSetup);
  app.get('/icoDashboardSetup/client/:clientEmail/getSiteConfiguration',isLoggedIn,impl.getSiteConfiguration);

  app.get('/test',function (req,res) {

    var b64string = __dirname + './download.png';
    var buf = Buffer.from(b64string, 'base64');

    res.send({"buffer":buf});

  });
  app.post('/icoDashboardSetup/client/:clientEmail/updateSiteConfiguration',isLoggedIn,impl.updateSiteConfiguration)

  app.get('/icoDashboardSetup/client/:clientEmail', isLoggedIn, hasPackage3, impl.icoDashboardSetup);
  app.get('/userSignup', impl.getUserSignup);
  app.get('/userLogin', impl.getUserLogin);
  // app.get('/icoDashboardSetup//client/:clientEmail/getSiteConfiguration', isLoggedIn, impl.getSiteConfiguration);
  app.post('/userSignup', impl.postUserSignup);
  app.post('/userLogin', impl.postUserLogin);
  // app.post('/icoDashboardSetup//client/:clientEmail/updateSiteConfiguration', isLoggedIn, impl.updateSiteConfiguration);
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
  if (req.user.package3 == true) {
    return next();
  } else {
    req.flash('package_flash', 'You need to buy Package 3');
    res.redirect('/profile');
  }
}

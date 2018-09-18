const impl = require('./impl');
module.exports = function(app) {

  app.get('/buyPackage', isLoggedIn, impl.buyPackage);
  app.get('/payment', isLoggedIn, impl.payment);
  app.get('/buyToken', isLoggedIn, impl.buyToken);

}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

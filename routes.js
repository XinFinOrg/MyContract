module.exports = function (app) {
  app.get('/', isLoggedIn, function (req, res) {

    res.render('landingPage');
  });
  app.get('/privacyPolicy', function (req, res) {

    res.render('privacyPolicy');
  });
  app.get('/termsConditions', function (req, res) {

    res.render('termsConditions');
  });
  app.get('/faqs', function (req, res) {
    res.render('faqs')
  })
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    res.redirect('/dashboard');
  next();

  // if they aren't redirect them to the home page

}

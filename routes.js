module.exports = function(app){
  app.get('/', isLoggedIn, function(req, res) {

    res.render('login', { message: '' });
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    res.redirect('/dashboard');
  next();

  // if they aren't redirect them to the home page

}

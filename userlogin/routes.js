module.exports = function(app, passport) {

  app.get('/userlogin', function(req, res, next) {

    res.render('login', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // show the signup form
  app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/profile', isLoggedIn, function(req, res) {
    req.session.user = req.user;
    res.render('profile.ejs', {
      user: req.user // get the user out of session and pass to template
    });
  });

  // Passport auth routes
  app.get("/auth/google",
    passport.authenticate("google", {
      scope: ["profile ", "email"]
    })
  );

  app.get("/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

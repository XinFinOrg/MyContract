var passport = require('passport');

module.exports = {

  getLogin: function(req, res) {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  },

  postLogin: passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getSignup: function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  },

  postSignup: passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getProfile: function(req, res) {
    // console.log(req.session.passport.user);
    // console.log(req.user);
    res.render('profile.ejs', {
      user: req.user, // get the user out of session and pass to template
      message: req.flash('package_flash')
    });
  },

  googleLogin: passport.authenticate("google", {
    scope: ["profile ", "email"]
  }),

  googleLoginCallback: passport.authenticate("google", {
    successRedirect: '/profile',
    failureRedirect: '/'
  }),

  getLogout: function(req, res) {
    req.logout();
    res.redirect('/');
  },

  githubLogin: passport.authenticate('github'),

  githubLoginCallback: passport.authenticate('github', {
    successRedirect: '/profile',
    failureRedirect: '/'
  })


}

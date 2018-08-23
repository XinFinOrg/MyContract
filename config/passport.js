var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var configAuth = require('./auth');

// load up the user model
var User = require('../userlogin/models');


module.exports = function(passport) {


  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //local signup strategy for passport
  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
          'email': email
        }, function(err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {

            // if there is no user with that email
            // create the user
            var newUser = new User();

            // set the user's local credentials
            newUser.email = email;
            newUser.password = newUser.generateHash(password);
            newUser.cipher = newUser.generateCipher();
            var keyStore = newUser.generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.address;
            console.log(keyStore);;

            // save the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }

        });

      });

    }));

  //local login strategy for passport
  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({
        'email': email
      }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, user);
      });
    }));

  // passport strategy for google login
  passport.use(new GoogleStrategy({

      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({
          'email': profile.emails[0].value
        }, function(err, user) {
          if (err)
            return done(err);

          if (user) {

            // if a user is found, log them in
            user.google_id = profile.id;
            user.save(function(err) {
              if (err)
                throw err;
              return done(null, user);
            });
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new User();

            // set all of the relevant information
            newUser.google_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.cipher = newUser.generateCipher();
            var keyStore = newUser.generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.address;
            console.log(keyStore);

            // save the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });

    }));

  //passport strategy for github login
  passport.use(new GitHubStrategy({
      clientID: configAuth.githubAuth.clientID,
      clientSecret: configAuth.githubAuth.clientSecret,
      callbackURL: configAuth.githubAuth.callbackURL,
      scope: 'user:email'
    },
    function(token, refreshToken, profile, done) {
      // console.log(" in github 1.1",profile);
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({
          'email': profile.emails[0].value
        }, function(err, user) {
          if (err)
            return done(err);

          if (user) {

            // if a user is found, log them in
            user.github_id = profile.id;
            user.save(function(err) {
              if (err)
                throw err;
              return done(null, user);
            });
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new User();

            // set all of the relevant information
            newUser.github_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.cipher = newUser.generateCipher();
            var keyStore = newUser.generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.Promise.address;
            console.log(keyStore.Promise.address);

            // save the user
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));
}

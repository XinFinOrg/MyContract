var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var configAuth = require('./auth');
var Client = require('../database/config');
var bcrypt = require('bcrypt-nodejs');
var keythereum = require("keythereum");

  // methods ======================
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

 function generateNewAccount(password){
  var params = { keyBytes: 32, ivBytes: 16 };
  var dk = keythereum.create(params);
  return keythereum.dump(password, dk.privateKey, dk.salt, dk.iv)
};

function generateCipher(){
  return cipher = bcrypt.hashSync(((Math.random()* (99999 - 10000)) + 10000), bcrypt.genSaltSync(8), null);
};

module.exports = function(passport) {


  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.email);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    Client.find(id.email).then(client =>{
      done(null,client.dataValues);
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
        Client.find({
          where:{
          'email': email
          }
        }).then (client =>{
          // if there are any errors, return the error
          // if (err)
          //   return done(err);
          // check to see if theres already a user with that email
          if (client) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            // if there is no user with that email
            // create the user

            var newUser  = new Object();

            // set the user's local credentials
            newUser.email = email;
            newUser.password = generateHash(password);
            newUser.cipher = generateCipher();
            var keyStore = generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.address;
            Client.sync({force: false}).then(() => {
              // Table created
              return Client.create(newUser); 
            }).then(function(result) {
            if (!result)
                console.log("null");
              return done(null, newUser);
          })
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
    function(req, email, password, done) { 
      // callback with email and password from our form
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      Client.find({
        where:{
        'email': email
        }
      }).then (client =>{
        // if there are any errors, return the error before anything else
        // if (!client)
          return done(client);

        // if no user is found, return the message
        if (!client)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!client.dataValues.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

        // all is well, return successful user
        return done(null, client.dataValues);
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
        var newUser = new Object();

        // try to find the user based on their google id
        Client.find({
          where:{
          'email': profile.emails[0].value
          }
        }).then (client =>{
          if(client){
            newUser.google_id = profile.id;
            // if a user is found, log them in
            Client.update({"google_id":profile.id}, { 
              where: {'email': profile.emails[0].value }
            }).then(function(result) {
              if (!result)
                  console.log("null");
              return done(null, client.dataValues);
          })
            
          } else {
            // if the user isnt in our database, create a new user

            // set all of the relevant information
            newUser.google_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.cipher = generateCipher();
            var keyStore = generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.address;
            console.log(keyStore);

            // save the user
            Client.sync({force: false}).then(() => {
              // Table created
              return Client.create(newUser); 
            }).then(function(result) {
            if (!result)
                console.log("null");
              return done(null, newUser);
          })
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
        Client.find({
          where:{
          'email': profile.emails[0].value
          }
        }).then (client =>{
          var newUser = new Object();
          newUser.github_id = profile.id;

          if(client){
            Client.update({"github_id":profile.id},{where:{  'email': profile.emails[0].value }}).then(function(result) {
            if (!result)
                console.log("null");
              return done(null, client.dataValues);
          })
          } else {
            // if the user isnt in our database, create a new user
            // set all of the relevant information
            newUser.github_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.cipher = generateCipher();
            var keyStore = generateNewAccount(newUser.cipher);
            newUser.ethereumAccount = keyStore.address;

             // save the user
             Client.sync({force: false}).then(() => {
              // Table created
              return Client.create(newUser); 
            }).then(function(result) {
            if (!result)
                console.log("null");
              return done(null, newUser);
          })
          }
        });
      });
    }
  ));
}

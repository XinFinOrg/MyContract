var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var configAuth = require('./auth');
var fs = require('fs');
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var User = db.user;
var Address = db.userCurrencyAddress;
var Transactions = db.icotransactions;
var Project = db.projectConfiguration;
var bitcoin = require("bitcoinjs-lib");
let Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');
const Web3 = require('web3');
const web3 = new Web3();
const mailer = require("../emailer/impl");

// methods ======================
function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function generateNewAccount(password) {
  return web3.eth.accounts.create(web3.utils.randomHex(32));

};

module.exports = function (passport) {


  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {

    done(null, user.email);
  });

  // used to deserialize the user
  passport.deserializeUser(function (email, done) {
    client.find({
      where: {
        'email': email
      }
    }).then(client => {
      done(null, client.dataValues);
    }).catch(err => {
      console.log(err);
    });
  });

  //user signup strategy for passport
  passport.use('user-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        // find a user whose email is the same as the forms email
        User.find({
          where: {
            'email': email,
            'projectConfigurationCoinName': req.body.projectName
          }
        }).then(async user => {
          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            // if there is no user with that email
            // create the user

            console.log(req.body.projectName);
            //Find project details and map user
            var project = await Project.find({
              where: {
                'coinName': req.body.projectName
              }
            });

            Promise.all([generateEthAddress(), generateBTCAddress(), createNewUser(req)]).then(([createdEthAddress, createdBTCAddress, createdUser]) => {
              createdUser.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
              project.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
              project.addUser(createdUser);
              return done(null, createdUser.dataValues);
            });
          }
        });
      });
    }));

  //local login strategy for passport
  passport.use('user-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    async function (req, email, password, done) {
      // callback with email and password from our form
      // find a user whose email is the same as the forms email
      User.find({
        where: {
          'email': email,
          'projectConfigurationCoinName': req.body.projectName
        },
        attributes: ['email', 'password', 'projectConfigurationCoinName', 'emailVerified']
      }).then(user => {

        // if no user is found, return the message
        if (!user) {
          return done(null, false, 'No user found.');
        } else if (!user.emailVerified) {
          return done(null, false, 'That email is yet to be verified.');
        }
        // if the user is found but the password is wrong
        if (!bcrypt.compareSync(password, user.password))
          return done(null, false, 'Oops! Wrong password.');
        // all is well, return successful user
        return done(null, user.dataValues);
      });
    }));

  //local login strategy for passport
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, email, password, done) {
      // callback with email and password from our form
      // find a user whose email is the same as the forms email
      client.find({
        where: {
          'email': email
        }
      }).then(client => {

        // if no user is found, return the message
        if (!client)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
        // if the user is found but the password is wrong
        if (client.password == null || (!bcrypt.compareSync(password, client.password)))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        if (client.status == false)
          return done(null, false, req.flash('loginMessage', 'Oops! Active your Account! Check Your email for Activation Link.'));
        // all is well, return successful user
        return done(null, client);
      });
    }));

  //local signup strategy for passport
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
    function (req, email, password, done) {
      process.nextTick(function () {
        // find a user whose email is the same as the forms email
        client.find({
          where: {
            'email': email
          }
        }).then(async result => {
          // check to see if theres already a user with that email
          if (result) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            // if there is no user with that email
            // create the user
            var newUser = new Object();

            // set the user's local credentials
            newUser.email = email;
            newUser.password = generateHash(password);
            newUser.status = false;
            newUser.package1 = 0 ;
            Promise.all([generateEthAddress(), createNewClient(req)]).then(([createdEthAddress, createdClient]) => {
              createdClient.addUserCurrencyAddress(createdEthAddress);
              //activation email sender
              mailer.sendVerificationMail(req, email, email, bcrypt.hashSync(createdClient.dataValues.uniqueId, bcrypt.genSaltSync(8), null))
              return done(null, createdClient.dataValues, req.flash('loginMessage', 'Please verify your email address by clicking the link that we have mailed  you!'));
            });
          }
        });
      });
    }));

  // passport strategy for google login
  passport.use(new GoogleStrategy({

    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,

  },
    function (token, refreshToken, profile, done) {

      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function () {
        // try to find the user based on their google id
        client.find({
          where: {
            'email': profile.emails[0].value
          }
        }).then(async result => {
          if (result) {
            result.google_id = profile.id;
            result.status = true;
            await result.save();
            return done(null, result.dataValues);
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new Object();
            // set all of the relevant information
            newUser.google_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile.emails[0].value; // pull the first email
            newUser.status = true;
            newUser.package1 = 0 ;
            Promise.all([generateEthAddress()]).then(async ([createdEthAddress]) => {
              var createdClient = await client.create(newUser);
              createdClient.addUserCurrencyAddress(createdEthAddress);
              return done(null, createdClient.dataValues);
            })
          }
        });
      });

    }));

  // //passpoort strategy for facebook login
  passport.use(new FacebookStrategy(
    
    {
    clientID : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL : "https://mycontract.co/auth/facebook/callback",
    // profileURL: 'https://graph.facebook.com/v2.10/me',
    // authorizationURL: 'https://www.facebook.com/v2.10/dialog/oauth',
    // tokenURL: 'https://graph.facebook.com/v2.10/oauth/access_token',
    profileFields: ['email','first_name','last_name','gender','link']
  },
     
  // facebook will send back the token and profile
  function (token,refreshToken,profile,done) {
    // asynchronous
    process.nextTick(function () {
      // try to find the user based on their google id
      client.find({
        where: {
          'email': profile.emails[0].value
        }
      }).then(async result => {
        if (result) {
          result.facebook_id = profile.id;
          result.status = true;
          await result.save();
          return done(null, result.dataValues);
        } else {
          // if the user isnt in our database, create a new user
          var newUser = new Object();
          // set all of the relevant information
          newUser.facebook_id = profile.id;
          newUser.name = profile.displayName;
          newUser.email = profile.emails[0].value; // pull the first email
          newUser.status = true;
          newUser.package1 = 0 ;
          Promise.all([generateEthAddress()]).then(async ([createdEthAddress]) => {
            var createdClient = await client.create(newUser);
            createdClient.addUserCurrencyAddress(createdEthAddress);
            return done(null, createdClient.dataValues);
          })
        }
      });
    });
  }));  

  //passport strategy for github login
  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL, //for local -->  'http://localhost:4000/auth/github/callback'
    scope: 'user:email'
  },
    function (token, refreshToken, profile, done) {
      // console.log(" in github 1.1",profile);
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function () {

        // try to find the user based on their google id
        client.find({
          where: {
            'github_id': profile.id
          }
        }).then(async result => {
          if (result) {
            result.github_id = profile.id;
            result.status = true;
            await result.save();
            return done(null, result.dataValues);
          } else {
            // if the user isnt in our database, create a new user
            var newUser = new Object();
            // set all of the relevant information
            newUser.github_id = profile.id;
            newUser.name = profile.displayName;
            newUser.email = profile._json.email; // pull the first email
            newUser.status = true;
            newUser.package1 = 0 ;
            Promise.all([generateEthAddress()]).then(async ([createdEthAddress]) => {
              var createdClient = await client.create(newUser);
              createdClient.addUserCurrencyAddress(createdEthAddress);
              return done(null, createdClient.dataValues);
            });
          }
        });
      });
    }
  ));
}

function generateEthAddress() {
  return new Promise(async function (resolve, reject) {
    var newEthAddress = new Object();
    var keyStore = generateNewAccount();
    newEthAddress.privateKey = keyStore.privateKey;
    newEthAddress.address = keyStore.address;
    newEthAddress.currencyType = "masterEthereum";
    var createdEthAddress = await Address.create(newEthAddress);
    resolve(createdEthAddress);
  });
}

function generateBTCAddress() {
  return new Promise(async function (resolve, reject) {
    var newBTCAddress = new Object();
    const TestNet = bitcoin.networks.testnet;
    var keyPair = bitcoin.ECPair.makeRandom();
    let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    newBTCAddress.address = address;
    newBTCAddress.privateKey = keyPair.toWIF();
    newBTCAddress.currencyType = "masterBitcoin";
    var createdBTCAddress = await Address.create(newBTCAddress);
    resolve(createdBTCAddress);
  });
}

function createNewUser(req) {
  return new Promise(async function (resolve, reject) {
    var newUser = new Object();
    // set the user's local credentials
    newUser.email = req.body.email;
    newUser.password = generateHash(req.body.password);
    newUser.firstName = req.body.first_name;
    newUser.lastName = req.body.last_name;
    newUser.country = req.body.country_id;
    var createdUser = await User.create(newUser);
    sendUserVerificationMail(req, createdUser.email, createdUser.firstName, createdUser.uniqueId);
    resolve(createdUser);
  });
}


function createNewClient(req) {
  return new Promise(async function (resolve, reject) {
    var newUser = new Object();
    // set the user's local credentials
    newUser.email = req.body.email;
    newUser.password = generateHash(req.body.password);
    var createdClient = await client.create(newUser);
    resolve(createdClient);
  });
}

function sendVerificationMail(req, userEmail, userName, userHash) {
  var nodemailerservice = require('../emailer/impl');
  nodemailerservice.sendVerificationMail(req, userEmail, userName, userHash);
}

function sendUserVerificationMail(req, userEmail, userName, userHash) {
  var nodemailerservice = require('../emailer/impl');
  nodemailerservice.sendUserVerificationMail(req, userEmail, userName, userHash);
}

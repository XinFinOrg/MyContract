const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
var db = require('../database/models/index');
var User = db.user;
var Currency = db.currency;
var Address = db.userCurrencyAddress;
var Transactions = db.icotransactions;
var Project = db.projectConfiguration;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var configAuth = require('../config/auth');

router.get('/transactions', isAuthenticated, impl.getTransactions);
router.get('/wallets', isAuthenticated, impl.getWallets);
router.get('/kyc', isAuthenticated, impl.getKYC);
router.get('/logout', isAuthenticated, impl.logout);
router.get('/dashboard', isAuthenticated, impl.getDashboard);
router.get('/contact_us', isAuthenticated, impl.getContactPage);
router.post('/contact_us', isAuthenticated, impl.postContactPage);
router.get('/profile', isAuthenticated, impl.getProfileEditPage);
router.post('/profile', isAuthenticated, impl.postProfileEditPage);
router.get('/getUSDPrice', isAuthenticated, impl.getUSDPrice);
router.post('/kycUpload', isAuthenticated, impl.uploadKYC);

function isAuthenticated(req, res, next) {
  var token = req.cookies['token'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function(err, decoded) {
    if (err) {
      console.log(err);
      return res.redirect('/userLogin');
    } else {
      User.find({
        where: {
          'email': decoded.userEmail,
          'projectConfigurationCoinName': decoded.projectName
        },
        include: [Project, Address, Transactions]
      }).then(user => {
        req.user = user;
        next();
      });
    }
  });

}

module.exports = router;

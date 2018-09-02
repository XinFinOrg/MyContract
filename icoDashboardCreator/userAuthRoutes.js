const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
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
router.get('/profile', isAuthenticated, impl.getProfileEditPage);


function isAuthenticated(req, res, next)
{
  var token = req.cookies['token'];
  // JWT enabled login strategy for end user
  var decoded = jwt.verify(token, configAuth.jwtAuthKey.secret);
  req.user = decoded.user;
  next();
}








module.exports = router;

const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();
var jwt = require('jsonwebtoken');
var db = require('../database/models/index');
var User = db.user;
var Currency = db.currency;
var Address = db.userCurrencyAddress;
var Transactions = db.tokenTransferLog;
var Project = db.projectConfiguration;
var configAuth = require('../config/auth');

router.get('/transactions', isAuthenticated, kycVerified, impl.getTransactions);
router.get('/wallets', isAuthenticated, kycVerified, impl.getWallets);
router.get('/kyc', isAuthenticated, kycVerified, impl.getCompletedKYCPage);
router.get('/logout', isAuthenticated, impl.logout);
router.get('/dashboard', isAuthenticated, kycVerified, impl.getDashboard);
router.get('/contact_us', isAuthenticated, kycVerified, impl.getContactPage);
router.post('/contact_us', isAuthenticated, impl.postContactPage);
router.get('/profile', isAuthenticated, kycVerified, impl.getProfileEditPage);
router.post('/profile', isAuthenticated, impl.postProfileEditPage);
router.get('/getPrices', isAuthenticated, impl.getPrices);
router.post('/kycUpload', isAuthenticated, impl.uploadKYC);
router.post('/loadWallet', isAuthenticated, impl.loadWallet);
router.get('/api/checkBalances', isAuthenticated, impl.checkBalances);
router.get('/api/checkTokenBalances', isAuthenticated, impl.checkTokenBalances);
router.post('/api/buyToken', isAuthenticated, impl.buyToken);
router.post('/api/buyTokenBTC', isAuthenticated, impl.buyTokenBTC);
router.get('/api/checkTokenStats', isAuthenticated, impl.checkTokenStats);
router.get('/api/getTransactions', isAuthenticated, impl.getTransactionList);
router.get('/api/getBitcoinTransactions', isAuthenticated, impl.getBitcoinTransactionList);
router.get('/api/getTokenTransactions', isAuthenticated, impl.getTokenTransactionList);

function isAuthenticated(req, res, next) {
  var token = req.cookies['token'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function(err, decoded) {
    if (err) {
      return res.redirect('../userLogin');
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

function kycVerified(req, res, next) {
  console.log(req.user.kyc_verified)

  switch (req.user.kyc_verified) {
    case "active":
      {
        next();
      }
      break;
    case "pending":
      {
        res.render('userKYCPending', {
          user: req.user,
          projectConfiguration: req.user.projectConfiguration
        });
      }
      break;
    case "notInitiated":
      {
        res.render('userKYCPage', {
          user: req.user,
          projectConfiguration: req.user.projectConfiguration
        });
      }
      break;
    default:
      {
        res.redirect('../userLogin');
      }
      break;
  }
}

module.exports = router;

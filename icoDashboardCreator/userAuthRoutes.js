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
// router.get('/kyc', isAuthenticated, kycVerified, impl.getCompletedKYCPage);
router.get('/userLogout', isAuthenticated, impl.logout);
router.get('/profile', isAuthenticated, kycVerified, impl.getDashboard);
router.get('/platform/info', isAuthenticated, kycVerified, impl.platformInfo);
// router.get('/contact_us', isAuthenticated, kycVerified, impl.getContactPage);
// router.post('/contact_us', isAuthenticated, impl.postContactPage);
// router.get('/profile', isAuthenticated, kycVerified, impl.getProfileEditPage);
// router.post('/profile', isAuthenticated, impl.postProfileEditPage);
router.get('/platform/tokenPrice', isAuthenticated, impl.getPrices);
router.post('/kyc', isAuthenticated, impl.uploadKYC);
// router.post('/loadWallet', isAuthenticated, impl.loadWallet);
router.get('/balances', isAuthenticated, impl.checkBalances);
router.get('/tokenBalances', isAuthenticated, impl.checkTokenBalances);
router.post('/buyToken', isAuthenticated, impl.buyToken);
router.post('/buyTokenBTC', isAuthenticated, impl.buyTokenBTC);
// router.get('/api/checkTokenStats', isAuthenticated, impl.checkTokenStats);
router.get('/getTransactions', isAuthenticated, impl.getTransactionList);
router.get('/getBitcoinTransactions', isAuthenticated, impl.getBitcoinTransactionList);

function isAuthenticated(req, res, next) {
  // var token = req.cookies['token'];
  // JWT enabled login strategy for end user
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again." })
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
  switch (req.user.kyc_verified) {
    case "active":
      {
        next();
      }
      break;
    case "pending":
      {
        res.send({ status: false, message: "KYC is in pending state." });
      }
      break;
    case "notInitiated":
      {
        res.send({ status: false, message: "KYC is not initiated yet." });
      }
      break;
    default:
      {
        res.send({ status: false, message: "please login." });
      }
      break;
  }
}

module.exports = router;

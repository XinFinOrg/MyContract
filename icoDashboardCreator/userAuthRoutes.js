const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();


  router.get('/contact', function(req, res) {
    console.log('contact');
      return res.send({status : true});
  })


  router.get('/transactions', impl.getTransactions);
  router.get('/wallets', impl.getWallets);
  router.get('/kyc', impl.getKYC);
  router.get('/logout', impl.logout);
  router.get('/dashboard', function(req, res, next) {
    console.log("req has come");
    if (!req.user.kycStatus) {
      res.render('userDashboard', {
        user: req.user
      });
    } else {
      res.send("KYC Already Done");
    }
  });

module.exports = router;

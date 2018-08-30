const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();

  router.get('/transactions', impl.getTransactions);
  router.get('/wallets', impl.getWallets);
  router.get('/kyc', impl.getKYC);
  router.get('/logout', impl.logout);
  router.post('/dashboard', impl.getDashboard);

// router.post('/dashboard', (req, res,next) =>
// {

// });

module.exports = router;

const express = require('express');
const impl = require("./userAuthImpl");
const router = express.Router();

  router.get('/transactions', impl.getTransactions);
  router.get('/wallets', impl.getWallets);
  router.get('/kyc', impl.getKYC);
  router.get('/logout', impl.logout);
  router.get('/dashboard', impl.getDashboard);

module.exports = router;

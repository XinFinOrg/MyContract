var db = require('../database/models/index');
var User = db.User;
var configAuth = require('../config/auth');
const Binance = require('node-binance-api');
module.exports = {

  getTransactions: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      console.log(req.user);
      var projectConfiguration = req.user.projectConfigurations[0];
      res.render('userTransactionHistory', {
        user: req.user,
        projectConfiguration: projectConfiguration,
        transactions: projectConfiguration.icotransactions
      });
    }
  },

  getWallets: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      var projectConfiguration = req.user.projectConfigurations[0];
      res.render('userWalletPage', {
        user: req.user,
        projectConfiguration: projectConfiguration,
        addresses: projectConfiguration.userCurrencyAddresses
      });
    }
  },

  getKYC: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.render('kycComplete', {
        user: req.user
      });
    }
  },

  getContactPage: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.render('userContactPage', {
        user: req.user
      });
    }
  },

  getProfileEditPage: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.render('userProfileEdit', {
        user: req.user
      });
    }
  },

  logout: (req, res, next) => {
    var projectConfiguration = req.user.projectConfigurations[0];
    console.log(projectConfiguration);
    res.redirect('http://'+projectConfiguration.homeURL);
  },

  getDashboard: async (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
       });
    } else {
      const binance = require('node-binance-api')().options({
        APIKEY: configAuth.binanceKey.apiKey,
        APISECRET: configAuth.binanceKey.apiSecret,
        useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
        test: true // If you want to use sandbox mode where orders are simulated
      });

      binance.prices('BTCUSDT', (error, ticker) => {
        console.log("Price of BTC: ", ticker.BTCUSDT);
      });
      binance.prices('ETHUSDT', (error, ticker) => {
        console.log("Price of ETH: ", ticker.ETHUSDT);
      });
      var projectConfiguration = req.user.projectConfigurations[0];
      res.render('userDashboard', {
        user: req.user,
        projectConfiguration: projectConfiguration,
      });
    }
  }

}

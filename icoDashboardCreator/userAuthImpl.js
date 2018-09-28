var db = require('../database/models/index');
var User = db.user;
var fs = require('fs');
var configAuth = require('../config/auth');
const Binance = require('node-binance-api');
module.exports = {

  getTransactions: (req, res, next) => {
    console.log(req.user);
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userTransactionHistory', {
      user: req.user,
      projectConfiguration: projectConfiguration,
      transactions: req.user.icotransactions
    });
  },

  getWallets: (req, res, next) => {
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userWalletPage', {
      user: req.user,
      projectConfiguration: projectConfiguration,
      addresses: req.user.userCurrencyAddresses
    });
  },

  getContactPage: (req, res, next) => {
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userContactPage', {
      user: req.user,
      projectConfiguration: projectConfiguration
    });
  },

  getProfileEditPage: (req, res, next) => {
    res.render('userProfileEdit', {
      user: req.user
    });
  },

  postProfileEditPage: (req, res, next) => {
    User.update({
      'firstName': req.body.first_name,
      'lastName': req.body.last_name,
      'country': req.body.country_id
    }, {
      where: {
        'email': req.user.email,
        'projectConfigurationCoinName': req.user.projectConfiguration.coinName
      }
    }).then(() => {
      res.redirect('/user/dashboard');
    });

  },

  logout: (req, res, next) => {
    res.clearCookie('token');
    res.redirect('../userSignup');
  },

  getDashboard: async (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      var projectConfiguration = req.user.projectConfiguration;
      res.render('userDashboard', {
        user: req.user,
        projectConfiguration: projectConfiguration,
      });
    }
  },

  getPrices: async (req, res, next) => {
    console.log("Getting price");
    const binance = Binance().options({
      APIKEY: configAuth.binanceKey.apiKey,
      APISECRET: configAuth.binanceKey.apiSecret,
      useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
      test: true // If you want to use sandbox mode where orders are simulated
    });

    binance.prices((error, ticker) => {
      console.log();
      res.send({
        BTC: 1/ticker.ETHBTC,
        BTCUSD: ticker.BTCUSDT,
        ETHUSD: ticker.ETHUSDT
      });
    });
  },

  uploadKYC: (req, res, next) => {
    User.update({
      'kycDoc1': fs.readFileSync(req.files[0].path),
      'kycDoc2': fs.readFileSync(req.files[1].path),
      'kycDoc3': fs.readFileSync(req.files[2].path)
    }, {
      where: {
        'email': req.user.email,
        'projectConfigurationCoinName': req.user.projectConfiguration.coinName
      }
    }).then(() => {
      res.redirect('/user/dashboard');
    });
  },

  postContactPage: (req, res, next) => {
    var nodemailerservice = require('../emailer/impl');
    nodemailerservice.sendEmail(req.body.enquiry_email, req.user.projectConfiguration.contactEmail, "Enquiry", req.body.enquiry_message);
    res.redirect('/user/dashboard');
  },

  getCompletedKYCPage: (req, res) => {
    res.render('kycComplete', {
      user: req.user
    });
  }
}

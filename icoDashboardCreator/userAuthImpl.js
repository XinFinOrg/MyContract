var db = require('../database/models/index');
var User = db.User;
var configAuth = require('../config/auth');
const ImageDataURI = require('image-data-uri');
const Binance = require('node-binance-api');
let Promise = require('bluebird');
module.exports = {

  getTransactions: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      console.log(req.user);
      var projectConfiguration = req.user.projectConfiguration;
      res.render('userTransactionHistory', {
        user: req.user,
        projectConfiguration: projectConfiguration,
        transactions: req.user.icotransactions
      });
    }
  },

  getWallets: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      var projectConfiguration = req.user.projectConfiguration;
      res.render('userWalletPage', {
        user: req.user,
        projectConfiguration: projectConfiguration,
        addresses: req.user.userCurrencyAddresses
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
    var projectConfiguration = req.user.projectConfiguration;
    console.log(projectConfiguration);
    res.redirect('http://' + projectConfiguration.homeURL);
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

  getUSDPrice: async (req, res, next) => {
    console.log("Getting price");
    const binance = Binance().options({
      APIKEY: configAuth.binanceKey.apiKey,
      APISECRET: configAuth.binanceKey.apiSecret,
      useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
      test: true // If you want to use sandbox mode where orders are simulated
    });

    binance.prices((error, ticker) => {
      res.send({
        ETH: ticker.ETHUSDT,
        BTC: ticker.BTCUSDT
      });
    });
  },

  uploadKYC: (req, res, next) => {
    var promises = [];
    for(var i=0; i<req.files.length; i++){
      promises.push(createDataURI(req.files[i].path, i));
    }
    Promise.all(promises).then((results)=>{
      console.log(results);
    });
  }


}

function createDataURI(file, counter){
  ImageDataURI.encodeFromFile(file)
    .then(imgurl => {
      console.log(counter);
      return imgurl;
    });

}

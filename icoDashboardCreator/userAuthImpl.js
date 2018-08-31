var db = require('../database/models/index');
var User = db.User;
module.exports = {

  getTransactions: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.render('userTransactionHistory', {
        user: req.user
      });
    }
  },

  getWallets: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.render('userWalletPage', {
        user: req.user
      });
    }
  },

  getKYC: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.send("KYC Already Done");
    }
  },

  logout: (req, res, next) => {

  },

  getDashboard: async (req, res, next) => {
    console.log("req has come");
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      console.log("Inside get dashboard");
      var icoSiteConfig = req.user.Client.ICOSiteConfigs[0];
      res.render('userDashboard', {
        user: req.user,
        icoSiteConfig: icoSiteConfig

      });
    }
  }

}

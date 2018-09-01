var db = require('../database/models/index');
var User = db.User;
module.exports = {

  getTransactions: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      var icoSiteConfig = req.user.ICOSiteConfig;
      res.render('userTransactionHistory', {
        user: req.user,
        icoSiteConfig: icoSiteConfig
      });
    }
  },

  getWallets: (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      console.log(req.user.UserCurrencyAddresses)
      var icoSiteConfig = req.user.ICOSiteConfig;
      res.render('userWalletPage', {
        user: req.user,
        icoSiteConfig: icoSiteConfig
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
      console.log(req.user);
      var icoSiteConfig = req.user.ICOSiteConfig;
      res.render('userDashboard', {
        user: req.user,
        icoSiteConfig: icoSiteConfig
      });
    }
  }

}

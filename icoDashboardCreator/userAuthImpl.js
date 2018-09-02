var db = require('../database/models/index');
var User = db.User;
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
      console.log(req.user);
      var projectConfiguration = req.user.projectConfigurations[0];
      res.render('userDashboard', {
        user: req.user,
        projectConfiguration: projectConfiguration
      });
    }
  }

}

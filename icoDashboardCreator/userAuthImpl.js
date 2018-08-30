module.exports = {

  getTransactions: (req, res, next) => {
    if (!req.user.kycStatus) {
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
    if (!req.user.kycStatus) {
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
    if (!req.user.kycStatus) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      res.send("KYC Already Done");
    }
  },

  logout: (req, res, next) => {

  }

}

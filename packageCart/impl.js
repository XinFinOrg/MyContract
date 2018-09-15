var QRCode = require('qrcode');
var db = require('../database/models/index');
var client = db.client;
var paymentListener = require('./paymentListener');

module.exports = {
  buyPackage: function(req, res) {
    client.find({
      where: {
        'email': req.user.email
      }
    }).then(async client => {
      client.getUserCurrencyAddresses().then(async addresses => {
        var address = addresses[0].address;
        var balance = await paymentListener.checkBalance(address);
        addresses[0].balance = balance;
        await addresses[0].save();
        res.render('buyPackage', {
          client: client,
          address: address,
          balance: balance
        });
      });
    });
  },

  payment: function(req, res) {
    client.find({
      where: {
        'email': req.user.email
      }
    }).then(async client => {
      client.getUserCurrencyAddresses().then(async addresses => {
        var address = addresses[0].address;
        var balance = await paymentListener.checkBalance(address);
        if (balance >= 1001) {
          var receipt = await paymentListener.sendToParent(address, addresses[0].privateKey);
          console.log("Receipt is", receipt);
          var status = paymentListener.attachListener(address);
          req.flash('package_flash', 'Successfully initiated payment. Please try after some time');
          res.redirect('/profile');
        } else {
          req.flash('package_flash', 'Insufficient funds to buy Package');
          res.redirect('/profile');
        }
      });
    });
  }
}

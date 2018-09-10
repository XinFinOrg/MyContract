var QRCode = require('qrcode');
var db = require('../database/models/index');
var client = db.client;

module.exports = {
  buyPackage: function(req, res) {
   // res.send("Package Card Page");

    res.render('buyPackage');
  },

  payment: function(req, res) {
    // res.send("Package Card Page");
    client.find({
      where: {
        'email': req.user.email
      },
      include: ['userCurrencyAddresses']
    }).then(result => {
      console.log(result.userCurrencyAddresses[0].dataValues.address)
   
     res.render('payment',{user:result.userCurrencyAddresses[0].dataValues.address});
    })
   },

   getQRcode: function(req, res){
     QRCode.toDataURL('Hello', function (err, url) {
       console.log(url)
     });
   }
}

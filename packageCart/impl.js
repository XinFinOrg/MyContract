var QRCode = require('qrcode');

module.exports = {
  buyPackage: function(req, res) {
   // res.send("Package Card Page");

    res.render('buyPackage');
  },

  payment: function(req, res) {
    // res.send("Package Card Page");

     res.render('payment');
   },

   getQRcode: function(req, res){
     QRCode.toDataURL('Hello', function (err, url) {
       console.log(url)
     });
   }
}

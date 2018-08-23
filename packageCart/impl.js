var QRCode = require('qrcode')

module.exports = {
  buyPackage: function(req, res) {
    QRCode.toDataURL('Hello', function (err, url) {
      console.log(url)
    });
    // res.send("Package Card Page");
    res.render('qrCode.ejs');
  }
}

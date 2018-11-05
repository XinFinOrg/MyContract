const impl = require('./impl');
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
module.exports = function(app) {

  app.get('/buyPackage', isLoggedIn, impl.buyPackage);
  app.get('/payment', isLoggedIn, impl.payment);
  app.get('/buyToken', isLoggedIn, impl.buyToken);
  app.get('/getBalances', isLoggedIn, impl.getBalances);
  app.post('/api/getPaymentToken', isLoggedIn, impl.getPaymentToken);
  app.post('/api/sendPaymentInfo', isLoggedIn, impl.sendPaymentInfo);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function(err, decoded) {
    if (err) {
      return res.redirect('/');
    } else {
      client.find({
        where: {
          uniqueId: decoded.userId
        }
      }).then(user => {
        req.user = user;
        next();
      });
    }
  });

}

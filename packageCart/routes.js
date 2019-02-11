const impl = require('./impl');
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
var admin = db.admin;
var Address = db.userCurrencyAddress;
var Project = db.projectConfiguration;
var Address = db.userCurrencyAddress;
var Project = db.projectConfiguration;
module.exports = function (app) {

  // app.get('/buyPackage', isLoggedIn, impl.buyPackage);
  app.post('/v1/package/FirstPackage', isLoggedIn, impl.payment);
  // app.get('/buyToken', isLoggedIn, impl.buyToken);
  app.get('/getBalances', isLoggedIn, impl.getBalances);
  app.post('/api/getPaymentToken', isLoggedIn, impl.getPaymentToken);
  app.post('/api/sendPaymentInfo', isLoggedIn, impl.sendPaymentInfo);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // JWT enabled login strategy for end user
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.status(400).send({ message: "please login again" })
    } else {
      client.find({
        where: {
          uniqueId: decoded.userId
        },
        include: [Project, Address]
      }).then(user => {
        req.user = user;
        next();
      });
    }
  });
}



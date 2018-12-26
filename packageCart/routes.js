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
  app.post('/buyFirstPackage', isLoggedIn, impl.payment);
  app.get('/buyToken', isLoggedIn, impl.buyToken);
  app.get('/getBalances', isLoggedIn, impl.getBalances);
  app.post('/api/getPaymentToken', isLoggedIn, impl.getPaymentToken);
  app.post('/api/sendPaymentInfo', isLoggedIn, impl.sendPaymentInfo);
}

// route middleware to make sure a user is logged in
// // route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // JWT enabled login strategy for end user
  if (req.cookies['clientToken'] || req.cookies['superAdminToken']) {
    var token = req.cookies['clientToken'] //  ? null : req.cookies['superAdminToken'];
    console.log("here", token)
    jwt.verify(token, configAuth.jwtAuthKey.secret, function (err, decoded) {
      if (err) {
        return res.send({ status: false, message: "please login again", err: err }) //res.redirect('/');
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
  else if (req.cookies['adminToken']) {
    console.log("here 2")
    var token = req.cookies['adminToken']
    jwt.verify(token, configAuth.jwtAuthKey.secret, function (err, decoded) {
      if (err) {
        return res.send({ status: false, message: "please login again" }) //res.redirect('/');
      } else {
        admin.find({
          where: {
            uniqueId: decoded.userId
          },
          include: [Address]
        }).then(user => {
          req.user = user;
          next();
        });
      }
    });
  }
}

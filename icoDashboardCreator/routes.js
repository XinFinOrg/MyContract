const impl = require("./impl");
var db = require('../database/models/index');
var path = require('path');
var client = db.client;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var ProjectConfiguration = db.projectConfiguration;


module.exports = function (app, express) {
  // app.get('/contractInteraction/project/:projectName', isLoggedIn, impl.contractInteraction);
  // app.post('/api/contractInteraction/contractData', impl.contractData);

  app.get('/api/icoDashboardSetup/project/:tokenName', isLoggedIn, hasVerified, hasPackage3, impl.icoDashboardSetup);
  // app.get('/siteConfiguration/project/:projectName', isLoggedIn, hasVerified, hasPackage3, impl.siteConfiguration);
  app.get('/api/siteConfiguration/project/:tokenName/getSiteConfiguration',isLoggedIn, impl.getSiteConfiguration);
  app.post('/api/siteConfiguration/project/:tokenName/updateSiteConfiguration',isLoggedIn, impl.updateSiteConfiguration)
  app.get('/api/transaction/project/:tokenName',isLoggedIn, impl.getTransaction)
  app.post('/icoDashboard/transaction/project/:projectName/initiateTransferReq',isLoggedIn,impl.initiateTransferReq)
  app.post('/icoDashboard/transaction/project/:projectName/tokenTrasfer',isLoggedIn,impl.tokenTrasfer)


  // app.get('/icoDashboardSetup/project/:projectName/kyctab',isLoggedIn, impl.getKYCPage);
  app.get('/icoDashboardSetup/project/:tokenName/kyctab/getICOUsersData',isLoggedIn, impl.getICOdata);
  app.get('/icoDashboardSetup/project/:tokenName/userId/:uniqueId/getUserData',isLoggedIn, impl.getUserData);
  app.post('/icoDashboardSetup/project/:tokenName/userId/:uniqueId/updateUserData', isLoggedIn,impl.updateUserData);

  app.get('/:projectName/userSignup', impl.getUserSignup);
  app.get('/:projectName/userLogin', impl.getUserLogin);
  app.post('/:projectName/userSignup', impl.postUserSignup);
  app.post('/:projectName/userLogin', impl.postUserLogin);
  app.get('/verifyMail', impl.verifyMail);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" })
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


// route middleware to check package 2
function hasPackage3(req, res, next) {
  ProjectConfiguration.find({
    where: {
      'client_id': req.user.uniqueId,
      'coinName': req.params.tokenName
    }
  }).then(result => {
    if (result.dataValues.isAllowedForICO == true) {
      return next();
    } else {
      req.flash('package_flash', 'You need to buy this package ');
      res.redirect('/dashboard');
    }
  })
}

function hasVerified(req, res, next) {
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(result => {
    console.log(result.dataValues.kyc_verified, "hello");
    switch (result.dataValues.kyc_verified) {
      case "active":
        { next(); }
        break;
      case "pending":
        { res.redirect('/KYCpage/pending'); }
        break;
      case "notInitiated":
        { res.redirect('/KYCpage'); }
        break;
      default:
        { res.redirect('/'); }
        break;
    }
  })
}

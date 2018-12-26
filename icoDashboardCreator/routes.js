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
  app.get('/api/siteConfiguration/project/:tokenName/getSiteConfiguration', isLoggedIn, hasVerified, hasPackage3, impl.getSiteConfiguration);
  app.post('/api/siteConfiguration/project/:tokenName/updateSiteConfiguration', isLoggedIn, hasVerified, hasPackage3, impl.updateSiteConfiguration)
  app.get('/api/transaction/project/:tokenName', isLoggedIn, hasVerified, hasPackage3, impl.getTransaction)
  app.post('/icoDashboard/transaction/project/:tokenName/initiateTransferReq', isLoggedIn, impl.initiateTransferReq)
  app.post('/icoDashboard/transaction/project/:tokenName/tokenTrasfer', isLoggedIn, impl.tokenTrasfer)


  // app.get('/icoDashboardSetup/project/:projectName/kyctab',isLoggedIn, impl.getKYCPage);
  app.get('/icoDashboardSetup/project/:tokenName/kyctab/getICOUsersData', isLoggedIn, hasVerified, hasPackage3, impl.getICOdata);
  app.get('/icoDashboardSetup/project/:tokenName/userId/:uniqueId/getUserData', isLoggedIn, impl.getUserData);
  app.post('/icoDashboardSetup/project/:tokenName/userId/:uniqueId/updateUserData', isLoggedIn, impl.updateUserData);

  //user login apis
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
      return res.send({ status: false, message: "please login again", err: err })
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
      res.send({ status: false, message: 'You need to buy this package ' });
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
        {
          res.send({ status: false, message: 'KYC status is pending!' });
        }
        break;
      case "notInitiated":
        {
          res.send({ status: false, message: 'In order to access this platform please do the KYC' });
        }
        break;
      default:
        {
          res.send({ status: false, message: 'In order to access this platform please do the KYC' });
        }
        break;
    }
  })
}

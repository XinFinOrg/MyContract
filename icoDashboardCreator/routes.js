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

  app.get('/v1/tokenization/:tokenName/details', isLoggedIn, hasVerified, hasPackage3, impl.icoDashboardSetup);
  // app.get('/siteConfiguration/project/:projectName', isLoggedIn, hasVerified, hasPackage3, impl.siteConfiguration);
  app.get('/v1/tokenization/:tokenName/configuration', isLoggedIn, hasVerified, hasPackage3, impl.getSiteConfiguration);
  app.post('/v1/tokenization/:tokenName/configuration', isLoggedIn, hasVerified, hasPackage3, impl.updateSiteConfiguration)
  app.get('/v1/tokenization/:tokenName/transactions', isLoggedIn, hasVerified, hasPackage3, impl.getTransaction)
  app.post('/v1/tokenization/:tokenName/token/transfer/pending', isLoggedIn, impl.initiateTransferReq)
  app.post('/v1/tokenization/:tokenName/token/transfer', isLoggedIn, impl.tokenTrasfer)


  // app.get('/icoDashboardSetup/project/:projectName/kyctab',isLoggedIn, impl.getKYCPage);
  app.get('/v1/tokenization/:tokenName/users/list', isLoggedIn, hasVerified, hasPackage3, impl.getICOdata);
  app.get('/v1/tokenization/:tokenName/user/:id', isLoggedIn, impl.getUserData);
  app.post('/v1/tokenization/:tokenName/user/:id', isLoggedIn, impl.updateUserData);

  //user login apis
  // app.get('/:projectName/user/signup', impl.getUserSignup);
  // app.get('/:projectName/user/login', impl.getUserLogin);
  app.post('/v1/:projectName/user/signup', impl.postUserSignup);
  app.post('/v1/:projectName/user/login', impl.postUserLogin);
  app.get('/verifyMail', impl.verifyMail);
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.status(400).send({ status: false, message: "please login again" })
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
    if (!result)
      return res.status(400).send({ status: false, message: "no record found" });
    if (result.isAllowedForICO == true) {
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
          res.status(400).send({ status: false, message: 'KYC status is pending!' });
        }
        break;
      case "notInitiated":
        {
          res.status(400).send({ status: false, message: 'In order to access this platform please do the KYC' });
        }
        break;
      default:
        {
          res.status(400).send({ status: false, message: 'In order to access this platform please do the KYC' });
        }
        break;
    }
  })
}

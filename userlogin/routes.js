var impl = require('./impl');
var superAdminimpl = require('./superAdminimpl');
var db = require('../database/models/index');
var client = db.client;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
module.exports = function (app) {

  // app.get('/login', impl.getLogin);
  app.post('/api/login', impl.postLogin);
  // app.get('/signup', impl.getSignup);
  app.post('/api/signup', impl.postSignup);
  // app.get('/dashboard', isLoggedIn, impl.getDashboard);
  app.get('/api/getProjectArray', isLoggedIn, impl.getProjectArray);
  // app.get('/api/profileDetails', isLoggedIn, impl.getProfileDetails);
  app.get('/api/getProfileDetails', isLoggedIn, impl.getAPIProfileDetails);
  // app.get('/faq', isLoggedIn, impl.getFAQ);
  app.get('/auth/google', impl.googleLogin);
  app.get('/auth/google/callback', impl.googleLoginCallback);
  app.get('/api/logout', impl.getLogout);
  app.get('/auth/github', impl.githubLogin);
  app.get('/auth/github/callback', impl.githubLoginCallback);
  // app.get('/api/projectList', impl.getProjectList);
  // app.get('/api/getClientList', impl.getClientList);
  app.get('/api/forgotPassword', impl.forgotPassword);
  // app.get('/resetPassword',impl.resetPassword);
  app.post('/api/updatePassword', impl.updatePassword);
  app.get('/verifyAccount', impl.verifyAccount);

  //new apis
  app.get('/api/checkExistence', impl.checkExistence);


  //kyc
  // app.get('/KYCpage', isLoggedIn, impl.KYCpage);
  // app.get('/KYCpage/pending', isLoggedIn, impl.KYCpagePending);
  app.post('/api/KYCdocUpload', isLoggedIn, impl.KYCdocUpload);

  //superUser
  // app.get('/adminLogin', superAdminimpl.adminLogin);
  app.post('/api/adminLogin', superAdminimpl.postLogin);
  app.get('/api/getKycDataForUser', isLoggedIn, superAdminimpl.getKycDataForUser);
  app.get('/api/getClientData/uid/:uid', isLoggedIn, superAdminimpl.getClientData);  
  app.post('/api/updateClientData/uid/:uid', isLoggedIn, superAdminimpl.updateClientData);  

};

// // route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  var token = req.cookies['clientToken'];
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" }) //res.redirect('/');
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

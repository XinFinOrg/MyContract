var impl = require('./impl');
var superAdminimpl = require('./superAdminimpl');
var db = require('../database/models/index');
var client = db.client;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
module.exports = function (app) {

  app.get('/login', impl.getLogin);
  app.post('/api/login', impl.postLogin);
  app.get('/signup', impl.getSignup);
  app.post('/signup', impl.postSignup);
  app.get('/dashboard', isLoggedIn, impl.getDashboard);
  app.get('/api/getProjectArray', isLoggedIn, impl.getProjectArray);
  app.get('/profileDetails', isLoggedIn, impl.getProfileDetails);
  app.get('/api/getProfileDetails', isLoggedIn, impl.getAPIProfileDetails);
  // app.get('/faq', isLoggedIn, impl.getFAQ);
  app.get('/auth/google', impl.googleLogin);
  app.get('/auth/google/callback', impl.googleLoginCallback);
  app.get('/logout', impl.getLogout);
  app.get('/auth/github', impl.githubLogin);
  app.get('/auth/github/callback', impl.githubLoginCallback);
  app.get('/projectList', isLoggedIn, impl.getProjectList);
  app.get('/forgotPassword', impl.forgotPassword);
  app.get('/resetPassword', impl.resetPassword);
  app.post('/updatePassword', impl.updatePassword);
  app.get('/verifyAccount', impl.verifyAccount);

  //new apis
  app.get('/api/checkExistence', impl.checkExistence);


  //kyc
  app.get('/KYCpage', isLoggedIn, impl.KYCpage);
  app.get('/KYCpage/pending', isLoggedIn, impl.KYCpagePending);
  app.post('/KYCpage/KYCdocUpload', isLoggedIn, impl.KYCdocUpload);

  //superUser
  // app.get('/adminLogin', superAdminimpl.adminLogin);
  app.post('/adminLogin', superAdminimpl.postLogin);
  app.get('/getKycDataForUser', isLoggedIn, superAdminimpl.getKycDataForUser);

};

// // route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {
//   // if user is authenticated in the session, carry on
//   if (req.isAuthenticated())
//     return next();
//
//   // if they aren't redirect them to the home page
//   res.redirect('/');
//
// }

function isLoggedIn(req, res, next) {
  var token = req.cookies['clientToken'];
  console.log(req.cookies)
  // JWT enabled login strategy for end user
  jwt.verify(token, configAuth.jwtAuthKey.secret, function (err, decoded) {
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

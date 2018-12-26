var impl = require('./impl');
var superAdminimpl = require('./superAdminimpl');
var adminimpl = require('./adminimpl');
var db = require('../database/models/index');
var client = db.client;
var admin = db.admin;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
module.exports = function (app) {

  //client apis
  // app.get('/login', impl.getLogin);
  app.post('/api/login', impl.postLogin);
  // app.get('/signup', impl.getSignup);
  app.post('/api/adminId/:adminId/signup', impl.postSignup);
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

  //superAdmin
  app.post('/api/superAdminLogin', superAdminimpl.postLogin);
  app.get('/api/superAdminLogout', superAdminimpl.postLogout);
  app.get('/api/getAllAdmins', superAdminimpl.getAllAdmins);
  app.get('/api/getKycDataForUser', isLoggedIn, superAdminimpl.getKycDataForUser);
  app.get('/api/getClientData/uid/:uid', isLoggedIn, superAdminimpl.getClientData);
  app.post('/api/updateClientData/uid/:uid', isLoggedIn, superAdminimpl.updateClientData);

  //admin
  app.post('/api/adminLogin', adminimpl.postLogin);
  app.post('/api/adminSignup', adminimpl.postSignup);
  // app.post('/api/makeAdminPayment',adminimpl.makePayment);
  app.post('/api/adminKYCupload', isAdminLoggedIn, adminimpl.adminKYCupload);
  app.get('/api/adminBalance', isAdminLoggedIn, adminimpl.adminBalance);
  app.get('/api/clientList', isAdminLoggedIn, adminimpl.getClientKYCData);
  app.post('/api/updateClientKYCData/uid/:uid', isAdminLoggedIn, adminimpl.updateClientKYC)
  app.get('/adminLogout', isAdminLoggedIn, adminimpl.Adminlogout);

};

// // route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // JWT enabled login strategy for end user
  // if (req.cookies['clientToken'] || req.cookies['superAdminToken']) {
  jwt.verify(req.cookies['clientToken'], configAuth.jwtAuthKey.secret, function (err, decoded) {
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

function isAdminLoggedIn(req, res, next) {
  // else if (req.cookies['adminToken']) {
  jwt.verify(req.cookies['adminToken'], configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" }) //res.redirect('/');
    } else {
      admin.find({
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
// }

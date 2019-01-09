var impl = require('./impl');
var superAdminimpl = require('./superAdminimpl');
var adminimpl = require('./adminimpl');
var db = require('../database/models/index');
var client = db.client;
var admin = db.admin;
var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var Address = db.userCurrencyAddress;

module.exports = function (app) {

  //client apis
  // app.get('/login', impl.getLogin);
  app.post('/api/clientLogin', impl.postLogin);
  // app.get('/signup', impl.getSignup);
  app.post('/api/adminId/:adminId/ClientSignup', adminCheck, impl.postSignup);
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
  app.get('/api/clientBalance', isLoggedIn, impl.getBalances);

  //new apis
  app.get('/api/checkExistence', impl.checkExistence);


  //kyc
  // app.get('/KYCpage', isLoggedIn, impl.KYCpage);
  // app.get('/KYCpage/pending', isLoggedIn, impl.KYCpagePending);
  app.post('/api/KYCdocUpload', isLoggedIn, impl.KYCdocUpload);

  //superAdmin
  app.post('/api/superAdminLogin', superAdminimpl.postLogin);
  app.get('/api/superAdminLogout', superAdminimpl.postLogout);
  app.get('/api/getAllAdmins', isSuperAdminLoggedIn, superAdminimpl.getAllAdmins);
  app.get('/api/getKycDataForUser', isSuperAdminLoggedIn, superAdminimpl.getKycDataForUser);
  app.get('/api/getClientData/uid/:uid', isSuperAdminLoggedIn, superAdminimpl.getClientData);
  app.post('/api/updateClientData/uid/:uid', isSuperAdminLoggedIn, superAdminimpl.updateClientData);

  //admin
  app.post('/api/adminLogin', adminimpl.postLogin);
  app.post('/api/adminSignup', adminimpl.postSignup);
  app.post('/api/makeAdminPayment', isAdminLoggedIn, isAdminVerified, adminimpl.makePayment);
  app.get('/api/adminDetails', isAdminLoggedIn, adminimpl.adminDetails);
  app.post('/api/adminKYCupload', isAdminLoggedIn, adminimpl.adminKYCupload);
  app.get('/api/adminBalance', isAdminLoggedIn, adminimpl.adminBalance);
  app.get('/api/clientList', isAdminLoggedIn, adminimpl.getClientList);
  app.get('/api/getClientKYCData/uid/:uid', isAdminLoggedIn, adminimpl.getClientKYCData);
  app.post('/api/updateClientKYCData/uid/:uid', isAdminLoggedIn, adminimpl.updateClientKYC)
  app.get('/adminLogout', isAdminLoggedIn, adminimpl.Adminlogout);
  app.get('/verifyAdminAccount', adminimpl.verifyAdminAccount);


};

// // route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // JWT enabled login strategy for end user
  // if (req.cookies['clientToken'] || req.cookies['superAdminToken']) {
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" }) //res.redirect('/');
    } else {
      client.find({
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

function isAdminLoggedIn(req, res, next) {
  // console.log(req.headers.authorization)
  jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
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



function isSuperAdminLoggedIn(req, res, next) {
  // else if (req.cookies['adminToken']) {
  jwt.verify(req.cookies['superAdminToken'], configAuth.jwtAuthKey.secret, function (err, decoded) {
    if (err) {
      return res.send({ status: false, message: "please login again" }) //res.redirect('/');
    } else {
      next();
    }
  });
}
// }  

function adminCheck(req, res, next) {
  admin.find({
    where: {
      uniqueId: req.params.adminId
    },
  }).then(user => {
    if (user.isAllowed == true) {
      next();
    }
    else {
      res.send({ status: false, message: "This URL is not valid!" })
    }
  });
}

function isAdminVerified(req, res, next) {
  if (req.user.kyc_verified == "active") {
    next();
  } else if (req.user.kyc_verified == "pending" || req.user.kyc_verified == "notInitiated") {
    res.send({ status: false, message: "KYC status is in pending state." })
  } else {
    res.send({ status: false, message: "Please contact Admin for more details" })
  }
}

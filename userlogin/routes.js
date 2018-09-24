var impl = require('./impl');
var db = require('../database/models/index');
var client = db.client;
module.exports = function (app) {

  app.get('/login', impl.getLogin);
  app.post('/login', impl.postLogin);
  app.get('/signup', impl.getSignup);
  app.post('/signup', impl.postSignup);
  app.get('/dashboard', isLoggedIn, impl.getDashboard);
  app.get('/profileDetails', isLoggedIn, impl.getProfileDetails);
  app.get('/faq', isLoggedIn, impl.getFAQ);
  app.get('/auth/google', impl.googleLogin);
  app.get('/auth/google/callback', impl.googleLoginCallback);
  app.get('/logout', impl.getLogout);
  app.get('/auth/github', impl.githubLogin);
  app.get('/auth/github/callback', impl.githubLoginCallback);
  app.get('/projectList', impl.getProjectList);
  app.get('/forgotPassword',impl.forgotPassword);
  app.get('/resetPassword',impl.resetPassword);
  app.post('/updatePassword',impl.updatePassword);
  // app.get('/getProjectArray', impl.getProjectArray);

  //kyc
  app.get('/KYCpage', isLoggedIn, impl.KYCpage);
  app.get('/KYCpage/pending', isLoggedIn, impl.KYCpagePending);
  app.post('/KYCpage/KYCdocUpload', isLoggedIn, impl.KYCdocUpload);
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

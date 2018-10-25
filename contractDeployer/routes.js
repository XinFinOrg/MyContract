const impl = require("./impl");
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;



module.exports = function (app, express) {
  app.use(express.static(path.join(__dirname, './dist')));
  app.get('/deployer', isLoggedIn, impl.getDeployer);
  app.get('/api/automaticDeployment', isLoggedIn, impl.getAutomaticDeployer);
  app.get('/getBytecode', isLoggedIn, impl.getBytecode);
  app.post('/saveDeploymentData', isLoggedIn, impl.saveDeploymentData);
  app.get('/generatedCrowdsaleContract', isLoggedIn, impl.generatedContract);
  app.get('/crowdsaleDeployer',isLoggedIn,impl.crowdsaleDeployer);

  // app.get('/test',impl.test);

}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

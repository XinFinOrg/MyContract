const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;

module.exports = function (app) {

  app.get('/customContract', isLoggedIn, impl.getCustomContractForm);
  app.get('/ERC223Contract', isLoggedIn, impl.getERC223ContractForm);
  app.get('/erc721Contract', isLoggedIn, impl.getERC721ContractForm);
  app.get('/generatedContract', isLoggedIn, impl.getGeneratedContract);
  app.get('/preDeployment', isLoggedIn, hasDeploymentPackage, impl.predeploymentPage);
  app.post("/createERC721", isLoggedIn, coinNameExist, hasPackage1, impl.createERC721Contract);
  app.post('/createERC20Contract', isLoggedIn, coinNameExist, impl.createERC20Contract);
  app.post('/createERC223Contract', isLoggedIn, coinNameExist, impl.createERC223Contract);

}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

async function coinNameExist(req, res, next) {
  if (req.body.token_symbol == "XDC" || req.body.token_symbol == "XDCE") {
    req.flash('project_flash', "Token Name Already Exist! Please Try Different Name.");
    res.redirect('/customContract');
  } else {
    await db.projectConfiguration.find({
      where: {
        'coinName': req.body.token_name
      }
    }).then(result => {
      // console.log(result,"here")
      if (result == null) {
        return next();
      } else {
        console.log("exist");
        req.flash('project_flash', "Token Name Already Exist! Please Try Different Name.");
        res.redirect('/customContract');
      }
    })
  }
}

// route middleware to check package 1
function hasPackage1(req, res, next) {
  console.log("Here");
  client.find({
    where: {
      'email': req.user.email
    }
  }).then(async result => {
    result.attemptsCount = result.attemptsCount + 1;
    await result.save().then(console.log("attmpt added", result.package1));
    if (result.package1 > 0) {
      return next();
    } else {
      req.flash('package_flash', "You need to buy Package 1 by contributing 1200000 XDCe");
      res.redirect('/generatedContract');
    }
  });
}

function hasDeploymentPackage(req, res, next) {
  client.find({
    where: {
      'email': req.user.email
    }, include: [{
      model: ProjectConfiguration,
      where: { coinSymbol: req.query.coinSymbol },
      required: false // as you want it in OR relation relation
    }]
  }).then(result => {
    console.log(result.ProjectConfigurations)
    if (result.projectConfigurations[0].isAllowedForDeployment) {
      next();
    } else {
      res.redirect('/generatedContract?coinSymbol=' + req.query.coinSymbol)
    }
  })
}

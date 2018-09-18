var passport = require('passport');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
var fs = require('fs');
var path = require('path');
var paymentListener = require('../packageCart/paymentListener');

module.exports = {

  getLogin: function (req, res) {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  },

  postLogin: passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getSignup: function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  },

  postSignup: passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getProfile: function (req, res) {
    var projectarray = [];
    client.findAll({
      where: {
        'email': req.user.email,
      },
      include: [{
        model: ProjectConfiguration,
      }],
    }).then(values => {
      values[0].projectConfigurations.forEach(element => {
        projectarray.push(element.dataValues);
      });
      res.render('profile.ejs', {
        user: req.user, // get the user out of session and pass to template
        ProjectConfiguration: projectarray,
        message: req.flash('package_flash'),
        contractMessage: req.flash('contract_flash')
      });
    })
  },

  googleLogin: passport.authenticate("google", {
    scope: ["profile ", "email"]
  }),

  googleLoginCallback: passport.authenticate("google", {
    successRedirect: '/profile',
    failureRedirect: '/'
  }),

  getLogout: function (req, res) {
    req.logout();
    res.redirect('/');
  },

  githubLogin: passport.authenticate('github'),

  githubLoginCallback: passport.authenticate('github', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }),

  KYCpage: function (req, res) {
    res.render('adminKYC.ejs', {
      user: req.user,
    })
  },
  KYCpagePending: function (req,res) {
    res.render('pendingAdminKYC.ejs', {
      user: req.user,
    })
  },
  KYCdocUpload: function (req, res) {
    client.update({
      "name":req.body.first_name+" "+req.body.last_name,
      "isd_code":req.body.ISD_code,
      "mobile":req.body.number,
      'kycDoc1': fs.readFileSync(req.files[0].path),
      'kycDoc2': fs.readFileSync(req.files[1].path),
      'kycDoc3': fs.readFileSync(req.files[2].path),
      "kyc_verified":"pending"
    }, {
      where: {
        'email': req.user.email
      }
    }).then(() => {
      res.redirect('/KYCpage/pending');
    });
  },

  getProjectList: (req, res) => {
    client.findAll({
      include: [ProjectConfiguration]
    }).then((clients)=>{
      res.render('projectList.ejs', {
        clients: clients
      })
    });
  },

  getProfileDetails: (req, res) => {
    var projectarray=[];
    client.find({
      where: {
        'email': req.user.email
      },
      include: [{
        model: ProjectConfiguration,
      }],
    }).then(async client => {
      client.projectConfigurations.forEach(element => {
        projectarray.push(element.dataValues);
      });
      client.getUserCurrencyAddresses().then(async addresses => {
        var address = addresses[0].address;
        var balance = await paymentListener.checkBalance(address);
        var ethBalance = await paymentListener.checkEtherBalance(address);
        addresses[0].balance = balance;
        await addresses[0].save();
        res.render('profileDetails', {
          user: client,
          address: address,
          balance: balance,
          ProjectConfiguration: projectarray,
          ethBalance: ethBalance
        });
      });
    });
  }

}

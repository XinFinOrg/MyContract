var passport = require('passport');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
var fs = require('fs');
var path = require('path');
var paymentListener = require('../packageCart/paymentListener');
var bcrypt = require('bcrypt-nodejs');
var mailer = require('../emailer/impl');

module.exports = {

  getLogin: function (req, res) {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  },

  postLogin: passport.authenticate('local-login', {
    successRedirect: '/dashboard', // redirect to the secure profile section
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
    successRedirect: '/dashboard', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getDashboard: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    console.log(projectArray);
    var address;
    address = req.cookies['address'];
    console.log("cookie is ", address);
    if (!address) {
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(async client => {
        var addresses = await client.getUserCurrencyAddresses();
        address = addresses[0].address;
        res.cookie('address', address, {
          expire: 360000 + Date.now()
        });
        res.render('profile.ejs', {
          user: req.user, // get the user out of session and pass to template
          ProjectConfiguration: projectArray,
          message: req.flash('package_flash'),
          contractMessage: req.flash('contract_flash'),
          address: address
        });
      });
    } else {
      res.render('profile.ejs', {
        user: req.user, // get the user out of session and pass to template
        ProjectConfiguration: projectArray,
        message: req.flash('package_flash'),
        contractMessage: req.flash('contract_flash'),
        address: address
      });
    }
  },

  googleLogin: passport.authenticate("google", {
    scope: ["profile ", "email"]
  }),

  googleLoginCallback: passport.authenticate("google", {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }),

  getLogout: function (req, res) {
    req.logout();
    res.clearCookie('address');
    res.redirect('/');
  },

  githubLogin: passport.authenticate('github'),

  githubLoginCallback: passport.authenticate('github', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }),

  KYCpage: function (req, res) {
    res.render('adminKYC.ejs', {
      user: req.user,
    })
  },
  KYCpagePending: function (req, res) {
    res.render('pendingAdminKYC.ejs', {
      user: req.user,
    })
  },
  KYCdocUpload: function (req, res) {
    client.update({
      "name": req.body.first_name + " " + req.body.last_name,
      "isd_code": req.body.ISD_code,
      "mobile": req.body.number,
      'kycDoc1': fs.readFileSync(req.files[0].path),
      'kycDoc2': fs.readFileSync(req.files[1].path),
      'kycDoc3': fs.readFileSync(req.files[2].path),
      "kyc_verified": "pending"
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
    }).then((clients) => {
      res.render('projectList.ejs', {
        clients: clients
      })
    });
  },

  getProfileDetails: async (req, res) => {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render('profileDetails', {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
  },

  getFAQ: async (req, res) => {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render('faq', {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
  },

  forgotPassword: (req, res) => {
    client.find({
      where: {
        'email': req.query.email
      }
    }).then(result => {
      mailer.forgotPasswordMailer(req, req.query.email, bcrypt.hashSync(result.dataValues.uniqueId, bcrypt.genSaltSync(8), null));
      res.send("sucess")
    })
  },
  resetPassword: (req, res) => {
    console.log(req.query)
    client.find({
      where: {
        'email': req.query.email
      }
    }).then(result => {
      if (!bcrypt.compareSync(result.dataValues.uniqueId, req.query.resetId)) { console.log("false") }
      else {
        console.log("true")
        res.render("resetPassword", { email: result.dataValues.email })
      }
    })
  },
  updatePassword: (req, res) => {
    console.log(req.body)
    client.find({
      where: {
        'email': req.body.email
      }
    }).then(result => {
      result.update({
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null)
      }).then(result => {
        res.redirect("/")
      })
    })
  }
};

function getProjectArray(email) {
  var projectArray = [];
  return new Promise(async function (resolve, reject) {
    client.find({
      where: {
        'email': email
      },
      include: [{
        model: ProjectConfiguration,
        attributes: ['coinName', 'contractAddress', 'contractHash']
      }],
    }).then(client => {
      client.projectConfigurations.forEach(element => {
        projectArray.push(element.dataValues);
      });
      // res.send({'projectArray': projectArray});
      resolve(projectArray);
    });
  });
}

var passport = require('passport');
const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
const ImageDataURI = require('image-data-uri');
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var User = db.user;
var ProjectConfiguration = db.projectConfiguration;
var fs = require('fs');
var Address = db.userCurrencyAddress;
var Transactions = db.icotransactions;
var Project = db.projectConfiguration;



module.exports = {
  //client setup
  icoDashboardSetup: function (req, res) {
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'index.ejs'), {
      user: req.user,
      address: address,
    });
  },

  siteConfiguration: function (req, res) {
    console.log(req.params, "project")
    res.render('siteConfiguration', {
      user: req.user,
      projectName: req.params.projectName
    });
  },
  getSiteConfiguration: function (req, res) {
    client.findAll({
      where: {
        'email': req.user.email,
      },
      include: [{
        model: ProjectConfiguration,
        where: {
          coinName: req.params.projectName
        }
      }],
    }).then(values => {
      if (!values) {
        res.send({
          message: "null!"
        });
      } else {
        var dataobj = new Object();
        dataobj = values[0].projectConfigurations[0].dataValues;
        if (values[0].projectConfigurations[0].dataValues.siteLogo) {
          dataobj.siteLogo = 'data:image/bmp;base64,' + Buffer.from(values[0].projectConfigurations[0].dataValues.siteLogo).toString('base64')
        } else {
          dataobj.siteLogo = null;
        }
        res.send({
          data: dataobj,
          message: "updated!"
        })
      }
    });
  },
  updateSiteConfiguration: async function (req, res) {
    var projectdata = await client.find({
      where: {
        'email': req.user.email
      },
      include: ['projectConfigurations'],
    })
    var projectdatavalues = await ProjectConfiguration.find({
      where: {
        "client_id": projectdata.projectConfigurations[0].dataValues.client_id
      }
    })
    if (req.files[0]) {
      console.log("here")
      projectdatavalues.siteLogo = fs.readFileSync(req.files[0].path)
      projectdatavalues.save().then((result, error) => { console.log("inside", error, result) })
    }

    // projectdata.dataValues.siteLogo = fs.readFileSync(req.files[0].path)
    ProjectConfiguration.update({
      "siteName": req.body.site_name,
      "coinName": req.body.coin_name,
      "softCap": req.body.soft_cap,
      "hardCap": req.body.hard_cap,
      "startDate": req.body.start_date,
      "endDate": req.body.end_date,
      "homeURL": req.body.website_url,
      "usdConversionRate": req.body.usd_conversion_rate,
      "minimumContribution": req.body.minimum_contribution,
    }, {
        where: {
          "client_id": projectdata.projectConfigurations[0].dataValues.client_id
        }
      }).then(updatedata => {
        if (!updatedata)
          console.log("Project update failed !");
        console.log("Project updated successfully!");
        res.redirect("/icoDashboardSetup/project/" + req.body.coin_name)
      });
  },

  getKYCPage: async function (req, res) {
    res.render("kyctab.ejs")
  },
  getICOdata: async function (req, res) {
    var userdata = await User.find({
      where: {
        "projectConfigurationCoinName": "don"
      },
      attributes: { exclude: ["mobile", "isd_code", "usertype_id", "updatedAt", "createdAt", "kycDoc3", "kycDocName3", "kycDoc2", "kycDocName2", "kycDoc1", "kycDocName1", "password", "uniqueId"] }
    })

    res.send({ data: [userdata.dataValues, userdata.dataValues, userdata.dataValues, userdata.dataValues, userdata.dataValues, userdata.dataValues] });
  },
  getUserData: async function (req, res) {
    var userdata = new Object();
    User.find({
      where: {
        "projectConfigurationCoinName": "don", "id": req.params.userid
      },
    }).then(result => {
      console.log(result.dataValues)
      userdata = result.dataValues;
      console.log(userdata, "helloS")

      if (result.dataValues.kycDoc1) {
        userdata.kycDoc1 = 'data:image/bmp;base64,' + Buffer.from(result.dataValues.kycDoc1).toString('base64')
        userdata.kycDoc2 = 'data:image/bmp;base64,' + Buffer.from(result.dataValues.kycDoc2).toString('base64')
        userdata.kycDoc3 = 'data:image/bmp;base64,' + Buffer.from(result.dataValues.kycDoc3).toString('base64')
      }
      res.render("adminKYCpanel.ejs", { KYCdata: userdata })
    })

  },
  updateUserData: async function (req, res) {
    var userdata = await User.find({
      where: {
        "projectConfigurationCoinName": "don", "id": req.params.userid
      },
    })
    userdata.kyc_verified = req.body.kyc_verified;
    userdata.status = req.body.status;
    userdata.save().then(function (result, error) {
      if (!result)
        console.log("not updated");
      console.log("updated");
    })
    res.redirect("/kycTab")
  },

  contractData: async function (req, res) {
    console.log(req.params);
    ProjectConfiguration.find({
      where: {
        'coinSymbol': req.params.projectName
      },
      attributes: { exclude: ["contractCode", "contractByteCode"] }
    }).then(result => res.send({ "tokenAddress": result.dataValues.contractAddress, "crowdSaleAddress": result.dataValues.contractAddress })
    )
  },

  //user login
  userLogin: function (req, res) {
    res.render("userLogin.ejs", {
      message: req.flash('loginMessage')
    });
  },
  getUserSignup: function (req, res) {
    res.render("userSignup.ejs", {
      projectName: req.params.projectName,
      message: req.flash('signupMessage')
    });
  },

  getUserLogin: function (req, res) {
    res.render("userLogin.ejs", {
      'projectName': req.params.projectName,
      message: req.flash('signupMessage')
    });
  },

  postUserLogin: async function (req, res, next) {
    passport.authenticate('user-login', {
      session: false
    }, async (err, user, info) => {
      console.log("This is :" + user);
      try {
        if (err || !user) {
          const error = new Error('An Error occured')
          console.log();
          return res.json({
            'token': "failure",
            'message': req.flash('loginMessage')
          });
        }
        const token = jwt.sign({
          userEmail: user.email,
          projectName: user.projectConfigurationCoinName
        }, configAuth.jwtAuthKey.secret, {
            expiresIn: configAuth.jwtAuthKey.tokenLife
          });
        //Send back the token to the user
        res.cookie('token', token, {
          expire: 360000 + Date.now()
        });
        return res.json({
          'token': "success"
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },

  postUserSignup: function (req, res, next) {
    passport.authenticate('user-signup', {
      session: false
    }, async (err, user, info) => {
      console.log(user);
      try {
        if (err || !user) {
          return res.redirect('./userSignup');
        }
        return res.redirect('./userLogin');
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },


  verifyMail: (req, res) => {
    console.log(req.query);
    db.user.find({
      where: {
        uniqueId: req.query.verificationId
      }
    }).then((user) => {
      user.emailVerified = true;
      user.save().then((user) => {
        res.redirect('./' + user.projectConfigurationCoinName + '/userLogin');
      });
    });
  }

}

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
var Project = db.projectConfiguration;
var transactionLog = db.tokenTransferLog;

module.exports = {
  //client setup
  contractInteraction: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'index.ejs'), {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
  },
  icoDashboardSetup: async function (req, res) {
    console.log(req.params, "project")
    res.render('icoDashboard', {
      user: req.user,
      projectName: req.params.projectName
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
    console.log(req.params.projectName)
    ProjectConfiguration.find({
      where: {
        'coinName': req.params.projectName
      },
      attributes: {
        exclude: ['coinName', 'ETHRate', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
      }
    }).then(values => {
      if (!values) {
        res.send({
          message: "null!"
        });
      } else {
        var dataobj = new Object();
        dataobj = values.dataValues;
        // if (values.dataValues.siteLogo) {
        //   dataobj.siteLogo ='data:image/bmp;base64,' + Buffer.from(values.dataValues.siteLogo).toString('base64')
        // } else {
        //   dataobj.siteLogo = null;
        // }
        res.send({
          data: dataobj,
          message: "updated!",
          Buffer: values.dataValues.siteLogo
        })
      }
    });
  },
  updateSiteConfiguration: async function (req, res) {
    var projectdatavalues = await ProjectConfiguration.find({
      where: {
        "coinName": req.params.projectName
      }
    })
    await ImageDataURI.encodeFromFile(req.files[0].path)
      .then(imgurl => {
        projectdatavalues.siteLogo = imgurl;
        projectdatavalues.siteName = req.body.site_name
        projectdatavalues.softCap = req.body.soft_cap
        projectdatavalues.hardCap = req.body.hard_cap
        projectdatavalues.startDate = req.body.start_date
        projectdatavalues.endDate = req.body.end_date
        projectdatavalues.homeURL = req.body.website_url
        projectdatavalues.minimumContribution = req.body.minimum_contribution
      })
    projectdatavalues.save().then(() => {
      console.log("Project updated successfully!");
      res.redirect("/siteConfiguration/project/" + req.params.projectName)
    });
  },

  getKYCPage: async function (req, res) {
    res.render("kyctab.ejs", {
      user: req.user,
      projectName: req.params.projectName
    })
  },
  getICOdata: async function (req, res) {
    userdata = new Object();
    userdata = await User.findAll({
      where: {
        "projectConfigurationCoinName": req.params.projectName
      },
      attributes: {
        exclude: ["mobile", "isd_code", "usertype_id", "updatedAt", "createdAt", "kycDoc3", "kycDocName3", "kycDoc2", "kycDocName2", "kycDoc1", "kycDocName1", "password"]
      }
    })
    userdata.forEach(element => {
      element.dataValues.link = "<a href='/icoDashboardSetup/project/" + req.params.projectName + "/kyctab/" + element.dataValues.uniqueId + "/getUserData'>click Here</a>"
      // console.log(element)
    });
    res.send({
      data: userdata
    });
  },
  getUserData: async function (req, res) {
    var userdata = new Object();
    User.find({
      where: {
        "projectConfigurationCoinName": req.params.projectName,
        "uniqueId": req.params.uniqueId
      },
    }).then(async result => {
      userdata = result.dataValues;
      res.render("adminKYCpanel.ejs", {
        KYCdata: userdata,
        projectName: req.params.projectName
      })
    })

  },
  updateUserData: async function (req, res) {
    console.log(req.params)
    var userdata = await User.find({
      where: {
        "projectConfigurationCoinName": req.params.projectName,
        "uniqueId": req.params.uniqueId
      },
    })
    userdata.kyc_verified = req.body.kyc_verified;
    userdata.status = req.body.status;
    userdata.save().then(function (result, error) {
      if (!result)
        console.log("not updated");
      console.log("updated");
    })
    res.redirect("/icoDashboardSetup/project/" + req.params.projectName + "/kyctab")
  },

  contractData: async function (req, res) {
    console.log(req.params);
    ProjectConfiguration.find({
      where: {
        'coinName': req.params.projectName
      },
      attributes: {
        exclude: ['coinName', 'ETHRate', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash', 'crowdsaleABICode', 'tokenABICode']
      }
    }).then(result =>
      res.send({
        "tokenAddress": result.dataValues.tokenContractAddress,
        "crowdSaleAddress": result.dataValues.crowdsaleContractAddress,
        "crowdsaleABICode": result.dataValues.crowdsaleABICode,
        "tokenABICode": result.dataValues.tokenABICode
      })
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
  },
  getTransaction: (req, res) => {
    res.render("transaction.ejs", {
      user: req.user,
      projectName: "XDC"
    });
  },
  getTransactionData: async (req, res) => {
    transactionLog = await db.projectConfiguration.find({
      where: {
        'coinName': "XDC"
      },
      exclude: ['coinName', 'ETHRate', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash', 'crowdsaleABICode', 'tokenABICode'],
      include: [{
        model: transactionLog,
      }]
    });
    res.send(transactionLog);
  }

}

function getProjectArray(email) {
  var projectArray = [];
  return new Promise(async function (resolve, reject) {
    client.find({
      where: {
        'email': email
      },
      include: [{
        model: ProjectConfiguration,
        attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
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

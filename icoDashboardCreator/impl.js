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
    ProjectConfiguration.find({
      where: {
        'coinName': req.params.tokenName
      },
      attributes: {
        exclude: ['coinName', 'ETHRate', 'networkURL', 'client_id', 'isAllowedForICO', 'bonusStatus', 'tokenContractCode', "tokenABICode", "crowdsaleABICode", 'networkType', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
      }
    }).then(values => {
      if (!values) {
        res.send({
          status: false,
          message: "no record found"
        });
      } else {
        var dataobj = new Object();
        dataobj = values.dataValues;
        res.send({
          status: true,
          data: dataobj
        })
      }
    });
  },
  updateSiteConfiguration: async function (req, res) {
    var projectdatavalues = await ProjectConfiguration.find({
      where: {
        "coinName": req.params.tokenName
      }
    })
    await ImageDataURI.encodeFromFile(req.files[0].path)
      .then(imgurl => {
        projectdatavalues.siteLogo = imgurl;
        projectdatavalues.siteName = req.body.siteName
        projectdatavalues.softCap = req.body.softCap
        projectdatavalues.hardCap = req.body.hardCap
        projectdatavalues.startDate = req.body.startDate
        projectdatavalues.endDate = req.body.endDate
        projectdatavalues.homeURL = req.body.homeURL
        projectdatavalues.minimumContribution = req.body.minimumContribution
      })
    projectdatavalues.save().then(() => {
      res.send({ status: true, message: "Project updated successfully!" })
    }).catch(function (err) {
      res.send({ status: false, message: "please try again later" })
    });
  },

  getKYCPage: async function (req, res) {
    res.render("kyctab.ejs", {
      user: req.user,
      projectName: req.params.projectName
    })
  },
  getICOdata: async function (req, res) {
    User.findAll({
      where: {
        "projectConfigurationCoinName": req.params.tokenName
      },
      attributes: {
        exclude: ["mobile", "isd_code", "usertype_id", "updatedAt", "createdAt", "kycDoc3", "kycDocName3", "kycDoc2", "kycDocName2", "kycDoc1", "kycDocName1", "password"]
      }
    }).then(userData => {
      res.send({ status: true, data: userData })
    }).catch(function (err) {
      res.send({ status: false, message: "no data found" })
    });
  },
  getUserData: async function (req, res) {
    User.find({
      where: {
        "projectConfigurationCoinName": req.params.tokenName,
        "uniqueId": req.params.uniqueId
      },
    }).then(async result => {
      res.send({
        status: true,
        UserData: result.dataValues,
      })
    }).catch(function (err) {
      res.send({ status: false, message: "no data found" })
    });
  },
  updateUserData: async function (req, res) {
    try {
      var userdata = await User.find({
        where: {
          "projectConfigurationCoinName": req.params.tokenName,
          "uniqueId": req.params.uniqueId
        },
      })
      userdata.kyc_verified = req.body.kycStatus;
      userdata.status = req.body.accountStatus;
      userdata.save().then(() => {
        res.send({ status: true, message: "data updated" })
      }).catch(function (err) {
        res.send({ status: false, message: "error occured" })
      });
    } catch{
      res.send({ status: false, message: "error occured" })

    }
  },

  contractData: async function (req, res) {
    ProjectConfiguration.find({
      where: {
        'coinSymbol': req.body.coinSymbol,
        'client_id': req.body.uniqueId
      },
      attributes: {
        exclude: ['coinName', 'ETHRate', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
      }
    }).then(result => {
      if (result == undefined) {
        res.send({
          "tokenAddress": "you are not allowed to access this page",
          "crowdSaleAddress": "you are not allowed to access this page",
        })
      } else {
        res.send({
          "tokenAddress": result.dataValues.tokenContractAddress,
          "crowdSaleAddress": result.dataValues.crowdsaleContractAddress,
          "crowdsaleABICode": result.dataValues.crowdsaleABICode,
          "tokenABICode": result.dataValues.tokenABICode
        })
      }
    })
  },

  //user login
  userLogin: function (req, res) {
    res.render("userLogin.ejs", {
      message: req.flash('loginMessage')
    });
  },
  getUserSignup: function (req, res) {
    ProjectConfiguration.find({
      where: {
        coinName: req.params.projectName
      }
    }).then(project => {
      if (project) {
        res.render("userSignup.ejs", {
          projectName: req.params.projectName,
          message: req.flash('signupMessage')
        });
      }
      else {
        res.send("404 Not Found");
      }
    })
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
      console.log("Info" + info);
      try {
        if (err || !user) {
          const error = new Error('An Error occured')
          console.log();
          return res.json({
            'token': "failure",
            'message': info
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
          status:true,
          token:token
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
          return res.send({ status: false, message: "Somthing went wrong! Please try again later." })
        }
        return res.send({ status: true, message: "signup Succesful" })
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },


  verifyMail: (req, res) => {
    db.user.find({
      where: {
        uniqueId: req.query.verificationId
      }
    }).then((user) => {
      user.emailVerified = true;
      user.save().then((user) => {
        res.render('blank');
      });
    });
  },
  getTransaction: async (req, res) => {
    transactionLog = await db.tokenTransferLog.findAll(
      { where: { 'project_id': req.params.tokenName }, raw: true }
    );
    res.send({
      transactionLog: transactionLog
    });
  },
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

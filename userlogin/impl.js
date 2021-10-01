var passport = require('passport');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
// var fs = require('fs');
var path = require('path');
// var paymentListener = require('../packageCart/paymentListener');
var bcrypt = require('bcrypt-nodejs');
var mailer = require('../emailer/impl');
const ImageDataURI = require('image-data-uri');
const readChunk = require('read-chunk');
const fileType = require('file-type');
var fs = require('fs');
const _ = require('lodash');
const userAddressDB = db.userCurrencyAddress;
const { Op } = require("sequelize");
console.log("in 111111111111")

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

  getpricedatafeed: function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('get-price-data-feed.ejs', {
    });
  },

  providers: function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('providers.ejs', {
    });
  },
  contact: function (req, res) {
    // render the page and pass in any flash data if it exists
    res.render('contact.ejs', {
    });
  },

  postSignup: passport.authenticate('local-signup', {
    successRedirect: '/login', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }),

  getDashboard: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    // console.log(projectArray);
    var address;
    address = req.cookies['address'];
    // console.log("cookie is ", address);
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
        req.toastr.info('You have successfully logged in.','Hello '+ req.user.email,{"positionClass": "toast-top-right","closeButton": true})
        res.render('profile.ejs', {
          req:req,
          user: req.user, // get the user out of session and pass to template
          ProjectConfiguration: projectArray.reverse(),
          message: req.flash('package_flash'),
          contractMessage: req.flash('contract_flash'),
          address: address,
          socialClient:client.password===null
        });
      });
    } else {
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(async client => {
        res.render('profile.ejs', {
          req:req,
          user: req.user, // get the user out of session and pass to template
          ProjectConfiguration: projectArray.reverse(),
          message: req.flash('package_flash'),
          contractMessage: req.flash('contract_flash'),
          address: address,
          socialClient:client.password===null          
        });
      }).catch(e =>{
        console.log(e);
      })
      
    }
  },

  googleLogin: passport.authenticate("google", {
    scope: ["profile ", "email"]
  }),

  googleLoginCallback: passport.authenticate("google", {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }),

  facebookLogin: passport.authenticate("facebook", {
    scope: [ "email"]
  }),

  facebookLoginCallback: passport.authenticate("facebook", {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  }), 

  getLogout: function (req, res) {
    req.logout();
    res.clearCookie('address');
    res.redirect('/dashboard');
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
  KYCdocUpload: async function (req, res) { //{ ext: 'jpg', mime: 'image/jpeg' }

    let buffer1 = readChunk.sync((req.files[0].path), 0, 4100);
    let buffer2 = readChunk.sync((req.files[1].path), 0, 4100);
    let buffer3 = readChunk.sync((req.files[2].path), 0, 4100);
    if (fileType(buffer1).mime == "image/jpeg" && fileType(buffer2).mime == 'image/jpeg' && fileType(buffer3).mime == 'image/jpeg') {
      client.update({
        "name": req.body.first_name + " " + req.body.last_name,
        "isd_code": req.body.ISD_code,
        "mobile": req.body.number,
        'kycDoc1': await ImageDataURI.encodeFromFile(req.files[0].path),
        'kycDoc2': await ImageDataURI.encodeFromFile(req.files[1].path),
        'kycDoc3': await ImageDataURI.encodeFromFile(req.files[2].path),
        "kyc_verified": "active"
      }, {
          where: {
            'email': req.user.email
          }
        }).then(() => {
          res.redirect('/KYCpage/pending');
        });
    } else {
      res.send("Error occured while uploading! Please check your images! it should be jpeg images")
    }
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
    try{
      var projectArray = await getProjectArray(req.user.email);
      var address = req.cookies['address'];
      const userClient = await client.findOne({where:{email:req.user.email}})
      res.render('profileDetails', {
        user: req.user,
        address: address,
        ProjectConfiguration: projectArray,
        socialClient:userClient.password===null
      });
    }
    catch(e){
      console.log(e);
    }

  },

  getFAQ: async (req, res) => {
    // var projectArray = await getProjectArray(req.user.email);
    // var address = req.cookies['address'];
    // res.render('faq', {
    //   user: req.user,
    //   address: address,
    //   ProjectConfiguration: projectArray,
    // });
    res.writeHead(301, {
      Location: 'https://articles.xinfin.org/mycontract'
    });
    res.end();
  },

  forgotPassword: (req, res) => {
    client.find({
      where: {
        'email': req.query.email
      }
    }).then(result => {
      if (result == null) {
        res.send("User not found")
      } else if (result.password == null) {
        res.send("Password")
      } else {
        mailer.forgotPasswordMailer(req, req.query.email, bcrypt.hashSync(result.dataValues.uniqueId, bcrypt.genSaltSync(8), null));
        res.send("success")
      }
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
  },
  verifyAccount: (req, res) => {
    console.log(req.query)
    client.find({
      where: {
        'email': req.query.email
      }
    }).then((client) => {
      client.status = true;
      client.save().then(res.redirect("/"));
    });
  },
  subscribe: (req, res) => {
    console.log(req.body)
    let fd;
    try {
      fd = fs.openSync('./subscribeData.txt', 'a');
      fs.appendFileSync(fd, JSON.stringify(req.body) + '\r\n', 'utf8');
    } catch (err) {
      console.log(err);
    } finally {
      if (fd !== undefined)
        fs.closeSync(fd);
      res.redirect('/');
    }
  },
  contactUs: (req, res) => {
    console.log(req.body)
    try {
      mailer.contactUs(req);
      res.redirect("/")
    } catch (err) {
      console.log(err);
    }
  },

  getPrivateKey: async (req, res) => {
    console.log("called getPrivateKey");
    try {
      const userEmail = req.user.email;
      const pwd = req.body.password;
      
      const userClient = await client.findOne({ where: { [Op.and]:[{email: userEmail},{status: true }]}});
      if (userClient === null) {
        return res.json({ status: false, error: "User not found" });
      }
      console.log(userClient.password,userClient.password===null,userClient.password==null);
      if (userClient.password!=null){
        if (_.isEmpty(pwd)) {
          return res.json({ status: false, error: "Invalid password" });
        }
        console.log(bcrypt.compareSync(pwd, userClient.password));
        if (!bcrypt.compareSync(pwd, userClient.password)) {
          return res.json({ status: false, error: "Incorrect password" });
        }
        const userAddress = await userAddressDB.findOne({
          where: {
            [Op.and]: [
              { currencyType: "masterEthereum" },
              { client_id: userClient.uniqueId },
            ],
          },
        });
        if (userAddress === null) {
          return res.json({ status: false, error: "User not found" });
        }
        const privKey = userAddress.privateKey;
        return res.json({ status: true, privKey: privKey });
      }else{
        const userAddress = await userAddressDB.findOne({
          where: {
            [Op.and]: [
              { currencyType: "masterEthereum" },
              { client_id: userClient.uniqueId },
            ],
          },
        });
        if (userAddress === null) {
          return res.json({ status: false, error: "User not found" });
        }
        const privKey = userAddress.privateKey;
        return res.json({ status: true, privKey: privKey });
      }

    } catch (e) {
      console.log("exception at userLogin.getPrivateKey: ", e);
      res.json({ status: false, error: "internal error" });
    }
  },

  getProjectKey: async (req, res) => {
    console.log("called getProjectKey");
    try {
      const projectId = req.body.projectId;
      const userEmail = req.user.email;
      const pwd = req.body.password;
      if (_.isEmpty(projectId)) {
        return res.json({
          status: false,
          error: "bad request, missing parameter(s)",
        });
      }
      const userClient = await client.findOne({ where: { [Op.and]:[{email: userEmail},{status: true }]}});
      if (userClient === null) {
        return res.json({ status: false, error: "User not found" });
      }
      // console.log(userClient.password);
      if (userClient.password!=null){
        if (_.isEmpty(pwd)) {
          return res.json({ status: false, error: "Invalid password" });
        }
        if (!bcrypt.compareSync(pwd, userClient.password)) {
          return res.json({ status: false, error: "Incorrect password" });
        }
        const userAddress = await userAddressDB.findOne({
          where: {
            [Op.and]: [
              { project_id: projectId },
              { currencyType: "Ethereum" },
              { client_id: userClient.uniqueId },
            ],
          },
        });
        if (userAddress === null) {
          return res.json({ status: false, error: "User not found" });
        }
        const privKey = userAddress.privateKey;
        res.json({ status: true, privKey: privKey });
      }else{
        const userAddress = await userAddressDB.findOne({
          where: {
            [Op.and]: [
              { project_id: projectId },
              { currencyType: "Ethereum" },
              { client_id: userClient.uniqueId },
            ],
          },
        });
        if (userAddress === null) {
          return res.json({ status: false, error: "User not found" });
        }
        const privKey = userAddress.privateKey;
        res.json({ status: true, privKey: privKey });
      }
      
    } catch (e) {
      console.log("exception ar userLogin/impl.getProjectKey: ", e);
      res.json({ error: "internal error", status: false });
    }
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
        attributes: ['coinName', 'tokenContractAddress', 'tokenContractHash', 'networkType', 'networkURL', 'crowdsaleContractAddress', 'crowdsaleContractHash']
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

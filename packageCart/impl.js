const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
var paymentListener = require('./paymentListener');
var ProjectConfiguration = db.projectConfiguration;
var Address = db.userCurrencyAddress;
var otpMailer = require("../emailer/impl");
var admin = db.admin;
module.exports = {
  buyPackage: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    var otpExist = false;
    if (req.user.paymentOTP) { otpExist = true }
    Promise.all([paymentListener.checkBalance(address)]).then(([balance]) => {
      res.render('buyPackage', {
        user: req.user,
        client: req.user,
        address: address,
        balance: balance,
        ProjectConfiguration: projectArray,
        otpField: otpExist,
      });
    });
  },

  payment: function (req, res) {
    if (!req.body.otpValue) {
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(client => {
        client.update({
          paymentOTP: Math.floor(Math.random() * 9999) + 1
        }).then(result => {
          console.log(req.user.email, result.dataValues.paymentOTP);
          otpMailer.sendConfirmationOTP(req.user.email, result.dataValues.paymentOTP)
          res.send({ status: true, message: "OTP  sent to your respective email address." })
        })
      });
    } else {
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(result => {
        if (result.dataValues.paymentOTP == req.body.otpValue) {
          Address.find({
            where: {
              'address': req.user.userCurrencyAddresses[0].address
            }
          }).then(address => {
            Promise.all([paymentListener.checkBalance(address.address)]).then(([balance]) => {
              if (balance >= 1200000) {
                var receipt = paymentListener.sendToParent(address.address, address.privateKey);
                console.log(receipt)
                paymentListener.attachListener(address.address);
                res.send({ status: true, message: 'Successfully initiated payment. You will be shortly alloted package credits' });
              } else {
                res.send({ status: false, message: 'Insufficient funds to buy Package' });
              }
            });
          })
        }
        else {
          console.log(false)
          res.send({ status: false });
        }
      })
    }
  },

  buyToken: (req, res) => {
    res.render('payment');
  },

  getBalances: (req, res) => {
    Promise.all([paymentListener.checkBalance(req.user.userCurrencyAddresses[0].address), paymentListener.checkEtherBalance(req.user.userCurrencyAddresses[0].address)]).then(([balance, ethBalance]) => {
      res.send({
        'XDCE': balance,
        'ETH': ethBalance
      });
    });
  },

  getPaymentToken: (req, res) => {
    console.log(req.user.uniqueId);
    console.log(req.body.address);
    const token = jwt.sign({
      userHash: req.user.uniqueId,
      address: req.body.address
    }, configAuth.jwtAuthKey.secret, {
        expiresIn: 60 * 3
      });
    //Send back the token to the user
    res.cookie('paymentToken', token, {
      expire: 3600 + Date.now()
    });
    return res.json({
      'token': "success"
    });
  },

  sendPaymentInfo: (req, res) => {
    // console.log(req.cookies['paymentToken']);
    jwt.verify(req.cookies['paymentToken'], configAuth.jwtAuthKey.secret, function (err, decoded) {
      console.log(decoded);
      paymentListener.attachListenerWithUserHash(decoded.userHash, decoded.address);
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

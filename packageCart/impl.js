var QRCode = require('qrcode');
var db = require('../database/models/index');
var client = db.client;
var paymentListener = require('./paymentListener');
var ProjectConfiguration = db.projectConfiguration;
var Address = db.userCurrencyAddress;
var otpMailer = require("../emailer/impl");
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
    console.log("datafromform", req.query,req.body,req.params);
    if (!req.query.otpValue) {
      console.log("here 1");
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
        })
      });
    } else {
      console.log("here 2");
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(client => {
        if (client.dataValues.paymentOTP == req.query.otpValue) {
          var addressCookie = req.cookies['address'];
          Address.find({
            where: {
              'address': addressCookie
            }
          }).then(address => {
            Promise.all([paymentListener.checkBalance(address.address)]).then(([balance]) => {
              if (balance >= 1001) {
                var receipt = paymentListener.sendToParent(address.address, address.privateKey);
                paymentListener.attachListener(address.address);
                req.flash('package_flash', 'Successfully initiated payment. You will be shortly alloted package credits');
              } else {
                req.flash('package_flash', 'Insufficient funds to buy Package');
              }
              res.redirect('/profile');
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
    var address = req.cookies['address'];
    Promise.all([paymentListener.checkBalance(address), paymentListener.checkEtherBalance(address)]).then(([balance, ethBalance]) => {
      res.send({
        'XDCE': balance,
        'ETH': ethBalance
      });
    });
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

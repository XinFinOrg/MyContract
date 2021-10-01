const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
var paymentListener = require('./paymentListener');
var auth = require('../config/auth')
var ProjectConfiguration = db.projectConfiguration;
var Address = db.userCurrencyAddress;
var otpMailer = require("../emailer/impl");
var paypal = require('paypal-rest-sdk');
var axios = require('axios');
paypal.configure(auth.paypal);

module.exports = {
  buyPackage: async function (req, res) {
    try{
    var projectArray = await getProjectArray(req.user.email);
    const cmcPrice = 50/(await axios.get("https://blockdegree.org/api/wrapCoinMarketCap")).data.data;
    var address = req.cookies['address'];
    var otpExist = false;
    if (req.user.paymentOTP) {
       otpExist = true 
      }
    Promise.all([paymentListener.checkBalance(address)]).then(([balance]) => {
      res.render('buyPackage', {
        user: req.user,
        client: req.user,
        address: address,
        balance: balance,
        ProjectConfiguration: projectArray,
        otpField: otpExist,
        sufficientBalance: parseFloat(cmcPrice)<=parseFloat(balance),
        priceXDCe:Math.floor(cmcPrice)
      });
    });
  }catch(e){console.log(e);}
  },

  payment: function (req, res) {
    if (!req.query.otpValue) {
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
      client.find({
        where: {
          'email': req.user.email
        }
      }).then(result => {
        if (result.dataValues.paymentOTP == req.query.otpValue) {
          var addressCookie = req.cookies['address'];
          console.log(addressCookie)
          Address.find({
            where: {
              'address': addressCookie
            }
          }).then(address => {
            console.log(address, "address");
            Promise.all([paymentListener.checkBalance(address.address)]).then(async ([balance]) => {
              try{
              const cmcData = await axios.get("https://blockdegree.org/api/wrapCoinMarketCap");
              const valUsd = 50/cmcData.data.data;

              if (balance >= valUsd*0.8 && balance <= valUsd*1.2) {
                var receipt = paymentListener.sendToParent(address.address, address.privateKey);
                paymentListener.attachListener(address.address);
                req.flash('package_flash', 'Successfully initiated payment. You will be shortly alloted package credits');
              } else {
                req.flash('package_flash', 'Insufficient funds to buy Package');
              }
              res.redirect('/dashboard');
            }catch(e){
              console.log(e);
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
    var address = req.cookies['address'];
    Promise.all([paymentListener.checkBalance(address), paymentListener.checkEtherBalance(address)]).then(([balance, ethBalance]) => {
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
    console.log(req.user.email, '<<<<<<<<<<< sendPaymentInfo')
    // console.log(req.cookies['paymentToken']);
    // jwt.verify(req.cookies['paymentToken'], configAuth.jwtAuthKey.secret, function (err, decoded) {
    //   console.log(decoded);
    //   paymentListener.attachListenerWithUserHash(decoded.userHash, decoded.address);
    // });
    client.find({
      where: {
        email: req.user.email 
      }
    }).then(async client => {
      console.log(client,'<<<<<<client data')
      client.package1 += 1;
      await client.save().then((result, error) => {
        if(error) console.error('Error in saving value',error)
        console.log('Result')
        res.send(result)
      });
    })
    // res.send({success: true})
  },
  getPaypalPayment: (req, res) => {
    let message = (req.query.errors == "false" || req.query.errors == undefined) ? "" : "Somthing went wrong please try again later"
    let txHash = (req.query.txHash == null) ? "" : req.query.txHash
    axios.get('https://api.coinmarketcap.com/v1/ticker/xinfin-network/')
      .then(function (response) {
        res.render('paypalPage', { data: response.data[0], message: message, txHash: txHash })
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  postPaypalPayment: (req, res) => {
    let description = JSON.stringify({ address: req.body.address, amount: req.body.amount })
    console.log(description)
    var payReq = JSON.stringify({
      intent: 'order',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: 'https://mycontract.co/paypal/process',
        cancel_url: 'https://mycontract.co/paypal?errors=true'
      },
      transactions: [{
        amount: {
          total: Math.floor(req.body.price * 100) / 100,
          currency: 'USD',
          "details": {
            "subtotal": Math.floor(req.body.price * 100) / 100,
            "tax": "0",
            "shipping": "0",
            "handling_fee": "0",
            "shipping_discount": "0",
            "insurance": "0"
          }
        },
        description: description,
        invoice_number: Math.floor(Math.random() * Math.floor(10000000000000)),
        payment_options: {
          allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
        },
      }]
    });

    paypal.payment.create(payReq, function (error, payment) {
      var links = {};

      if (error) {
        console.error(JSON.stringify(error));
      } else {
        // Capture HATEOAS links
        payment.links.forEach(function (linkObj) {
          links[linkObj.rel] = {
            href: linkObj.href,
            method: linkObj.method
          };
        })

        // If redirect url present, redirect user
        if (links.hasOwnProperty('approval_url')) {
          console.log(links['approval_url'].href)
          // REDIRECT USER TO links['approval_url'].href;
          res.redirect(links['approval_url'].href)

        } else {
          res.redirect('/paypal?errors=true')
        }
      }
    });
  },
  paymentProcess: (req, res) => {
    var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };
    var order;

    paypal.payment.execute(paymentId, payerId, function (error, payment) {
      if (error) {
        console.error(JSON.stringify(error));
      } else {
        if (payment.state === 'approved'
          && payment.transactions
          && payment.transactions[0].related_resources
          && payment.transactions[0].related_resources[0].order) {
          console.log('order authorization completed successfully');
          // Capture order id
          order = payment.transactions[0].related_resources[0].order.id;
          var capture_details = {
            amount: {
              currency: payment.transactions[0].amount.currency,
              total: payment.transactions[0].amount.total
            }
          };

          //make token transfer
          let temp = JSON.parse(payment.transactions[0].description);
          paymentListener.sendToken(temp.address, temp.amount).then((result => {
            //take payment 
            paypal.order.authorize(order, capture_details, function (error, authorization) {
              if (error) {
                console.error(JSON.stringify(error));
              } else {
                paypal.order.capture(order, capture_details, function (error, capture) {
                  if (error) {
                    console.error(error);
                  } else {
                    console.log("ORDER CAPTURE SUCCESS");
                    res.redirect('/paypal?txHash=' + result.transactionHash)
                  }
                });
              }
            });

          }))
        } else {
          console.log('payment not successful');
          // res.send({ error: error })
          res.redirect('/paypal?errors=true')
        }
      }
    });
  },
  
  getPaypalDirect: (req, res) => {
    var payReq = JSON.stringify({
      intent: 'order',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: 'https://mycontract.co/paypal/direct/process',
        cancel_url: 'https://mycontract.co/error'
      },
      transactions: [{
        amount: {
          total: 1500,
          currency: 'USD',
          "details": {
            "subtotal": 1500,
            "tax": "0",
            "shipping": "0",
            "handling_fee": "0",
            "shipping_discount": "0",
            "insurance": "0"
          }
        },
        description: "MyContract package 1",
        invoice_number: Math.floor(Math.random() * Math.floor(10000000000000)),
        payment_options: {
          allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
        },
        "custom": req.user.email,
        "item_list": {
          "items": [
            {
              "name": "Mycontract Package 1",
              "description": req.user.email,
              "quantity": "1",
              "price": "1500",
              "tax": "0",
              "sku": "0",
              "currency": "USD"
            },
          ]
        }
      }]
    });
    console.log(payReq)

    paypal.payment.create(payReq, function (error, payment) {
      var links = {};
      if (error) {
        console.log("Error in Paypal payment request while creation")
        console.error(JSON.stringify(error));
      } else {
        // Capture HATEOAS links
        payment.links.forEach(function (linkObj) {
          links[linkObj.rel] = {
            href: linkObj.href,
            method: linkObj.method
          };
        })

        // If redirect url present, redirect user
        if (links.hasOwnProperty('approval_url')) {
          console.log(links['approval_url'].href)
          // REDIRECT USER TO links['approval_url'].href;
          res.redirect(links['approval_url'].href)

        } else {
          res.redirect('/paypal?errors=true')
        }
      }
    });

  },
  processPaypalDirect: (req, res) => {
    var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };
    var order;

    paypal.payment.execute(paymentId, payerId, function (error, payment) {
      if (error) {
        console.error(JSON.stringify(error));
      } else {
        if (payment.state === 'approved'
          && payment.transactions
          && payment.transactions[0].related_resources
          && payment.transactions[0].related_resources[0].order) {
          console.log('order authorization completed successfully');
          // Capture order id
          order = payment.transactions[0].related_resources[0].order.id;
          var capture_details = {
            amount: {
              currency: payment.transactions[0].amount.currency,
              total: payment.transactions[0].amount.total
            }
          };

          //make token transfer
          client.find({
            where: {
              email: payment.transactions[0].custom 
            }
          }).then(async client => {
            client.package1 += 1;
            await client.save().then((result, error) => {
              if (error) {
                paypal.order.capture(order, capture_details, function (error, capture) {
                  if (error) {
                    console.error(error);
                  } else {
                    console.log("ORDER CAPTURE SUCCESS");
                    paypal.sale.refund(capture.id, capture_details, function (error, refund) {
                      if (error) {
                        console.error(JSON.stringify(error));
                      } else {
                        console.log("Refund Sale Response");
                      }
                    });
                  }
                });
              }
              paypal.order.capture(order, capture_details, function (error, capture) {
                if (error) {
                  console.error(error);
                } else {
                  console.log("ORDER CAPTURE SUCCESS");
                  res.redirect('/dashboard')
                }
              });
            });
          });
        } else {
          console.log('payment not successful');
          // res.send({ error: error })
          res.redirect('/error')
        }
      }
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

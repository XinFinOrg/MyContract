var db = require('../database/models/index');
var User = db.user;
var tokenTransferLog = db.tokenTransferLog;
const axios = require('axios');
var Address = db.userCurrencyAddress;
var fs = require('fs');
var configAuth = require('../config/auth');
const Binance = require('node-binance-api');
var coinPaymentHandler = require('../coinPayments/impl');
var icoListener = require('../icoHandler/listener');
var privateListener = require('../icoHandler/privateNetworkHandler');
const ImageDataURI = require('image-data-uri');
var privateIcoListener = require('../icoHandler/privateListener');
const readChunk = require('read-chunk');
const fileType = require('file-type');

module.exports = {

  getTransactions: async (req, res, next) => {
    var btc_address, eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    eth_address = eth_addresses[0].address;

    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterBitcoin'
      }
    });
    btc_address = btc_addresses[0].address;
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userTransactionHistory', {
      user: req.user,
      projectConfiguration: projectConfiguration,
      eth_address: eth_address,
      btc_address: btc_address,
      tokenTransferLogs: req.user.tokenTransferLogs
    });
  },

  getTokenTransactionList: async (req, res) => {
    res.send({
      tokenTransferLogs: req.user.tokenTransferLogs
    });
  },

  getWallets: (req, res, next) => {
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userWalletPage', {
      user: req.user,
      projectConfiguration: projectConfiguration,
      addresses: req.user.userCurrencyAddresses
    });
  },

  getContactPage: (req, res, next) => {
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userContactPage', {
      user: req.user,
      projectConfiguration: projectConfiguration
    });
  },

  getProfileEditPage: (req, res, next) => {
    res.render('userProfileEdit', {
      user: req.user,
      projectConfiguration: req.user.projectConfiguration
    });
  },

  postProfileEditPage: (req, res, next) => {
    User.update({
      'firstName': req.body.first_name,
      'lastName': req.body.last_name,
      'country': req.body.country_id
    }, {
        where: {
          'email': req.user.email,
          'projectConfigurationCoinName': req.user.projectConfiguration.coinName
        }
      }).then(() => {
        res.redirect('/user/dashboard');
      });

  },

  logout: (req, res, next) => {
    res.clearCookie('token');
    res.redirect('../userSignup');
  },

  getDashboard: async (req, res, next) => {
    if (!req.user.kyc_verified) {
      res.render('userKYCPage', {
        user: req.user
      });
    } else {
      var projectConfiguration = req.user.projectConfiguration;
      var startDate = new Date(projectConfiguration.startDate).toLocaleDateString();
      var endDate = new Date(projectConfiguration.endDate).toLocaleDateString();
      var startTime = new Date(projectConfiguration.startDate).toLocaleTimeString();
      var datetime = startDate + " " + startTime;
      res.render('userDashboard', {
        user: req.user,
        projectConfiguration: projectConfiguration,
        startDate: startDate,
        endDate: endDate,
        datetime: datetime
      });
    }
  },

  getPrices: async (req, res, next) => {
    const binance = Binance().options({
      APIKEY: configAuth.binanceKey.apiKey,
      APISECRET: configAuth.binanceKey.apiSecret,
      useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
      test: true // If you want to use sandbox mode where orders are simulated
    });

    binance.prices((error, ticker) => {
      if (error) {
        console.log(error);
      }

      res.send({
        BTC: 1 / ticker.ETHBTC,
        BTCUSD: ticker.BTCUSDT,
        ETHUSD: ticker.ETHUSDT
      });
    });
  },

  uploadKYC: async (req, res, next) => {

    let buffer1 = readChunk.sync((req.files[0].path), 0, 4100);
    let buffer2 = readChunk.sync((req.files[1].path), 0, 4100);
    let buffer3 = readChunk.sync((req.files[2].path), 0, 4100);
    if (fileType(buffer1).mime == "image/jpeg" && fileType(buffer2).mime == 'image/jpeg' && fileType(buffer3).mime == 'image/jpeg') {
      User.update({
        'kycDoc1': await ImageDataURI.encodeFromFile(req.files[0].path),
        'kycDoc2': await ImageDataURI.encodeFromFile(req.files[1].path),
        'kycDoc3': await ImageDataURI.encodeFromFile(req.files[2].path),
        'kyc_verified': 'pending'
      }, {
          where: {
            'email': req.user.email,
            'projectConfigurationCoinName': req.user.projectConfiguration.coinName
          }
        }).then(() => {
          res.redirect('/' + req.user.projectConfiguration.coinName + '/user/dashboard');
        });
    }
  },

  postContactPage: (req, res, next) => {
    var nodemailerservice = require('../emailer/impl');
    nodemailerservice.sendEmail(req.body.enquiry_email, req.user.projectConfiguration.contactEmail, "Enquiry", req.body.enquiry_message);
    res.redirect('/user/dashboard');
  },

  getCompletedKYCPage: (req, res) => {
    res.render('kycComplete', {
      user: req.user,
      projectConfiguration: req.user.projectConfiguration
    });
  },

  loadWallet: async (req, res) => {
    txInfo = await coinPaymentHandler.buyToken(req.body.second_currency, req.body.second_currency, req.body.amount, req.user.email, req.user.userCurrencyAddresses[0].address);
    res.render('userTokenPayment', {
      user: req.user,
      qrCodeLink: txInfo.qrcode_url
    });
  },

  checkBalances: async (req, res) => {
    var btc_address, eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    eth_address = eth_addresses[0].address; 

    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterBitcoin'
      }
    });

    btc_address = btc_addresses[0].address;
    Promise.all([icoListener.checkEtherBalance(eth_address), icoListener.checkBalance(btc_address)]).then(([ethBalance, btcBalance]) => {
      res.send({
        'balance': ethBalance,
        'btcBalance': btcBalance
      });
    });
  },

  checkTokenBalances: async (req, res) => {
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    eth_address = eth_addresses[0].address;
    if (req.user.projectConfiguration.networkType == "testnet") {
      var tokenBalance = await privateIcoListener.checkTokenBalance(eth_address, req.user.projectConfiguration.tokenContractAddress)
    }
    else if(req.user.projectConfiguration.networkType == "private"){
     var tokenBalance = await privateListener.checkTokenBalance(eth_address, req.user.projectConfiguration.tokenContractAddress)
    }
    else {
      var tokenBalance = await icoListener.checkTokenBalance(eth_address, req.user.projectConfiguration.tokenContractAddress)
    }
    res.send({
      'tokenBalance': tokenBalance
    });
  },

  buyToken: async (req, res) => {
    var eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    console.log(req.body.token_ETH);
    eth_address = eth_addresses[0].address;

    var masterETHList = await req.user.projectConfiguration.getUserCurrencyAddresses({
      where: {
        currencyType: 'Ethereum'
      }
    });
    var masterETHAddress = masterETHList[0].address;
    icoListener.buyToken(eth_address, masterETHAddress, eth_addresses[0].privateKey, req.body.amount)
      .then((receipt) => {
        initiateTokenTransfer(req.user, req.user.projectConfiguration, req.body.token_ETH, eth_address, "ETH");
      });
    res.redirect('../../user/dashboard');
  },

  buyTokenBTC: async (req, res) => {
    var eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    eth_address = eth_addresses[0].address;
    var btc_address;
    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterBitcoin'
      }
    });
    btc_address = btc_addresses[0].address;

    var masterBTCList = await req.user.projectConfiguration.getUserCurrencyAddresses({
      where: {
        currencyType: 'Bitcoin'
      }
    });
    var masterBTCAddress = masterBTCList[0].address;
    var bitcoinTransaction = require('bitcoin-transaction');
    //Send all my money from wallet1 to wallet2 on the bitcoin testnet
    var from = btc_address;
    console.log("From", from);
    var to = masterBTCAddress;
    var privKeyWIF = btc_addresses[0].privateKey;
    bitcoinTransaction.sendTransaction({
      from: from,
      to: to,
      privKeyWIF: privKeyWIF,
      btc: req.body.amount,
      network: "mainnet",
      fee: "fastest",
    }).then(receipt => {
      initiateTokenTransfer(req.user, req.user.projectConfiguration, req.body.token_BTC, eth_address, "BTC");
    });
    res.redirect('../../user/dashboard');
  },

  checkTokenStats: (req, res) => {
    // icoListener.checkTokenStats(req.user.projectConfiguration.tokenContractAddress).then(onSaleTokens => {
    //   res.send({'onSaleTokens': onSaleTokens});
    // });
    res.send("Hey");
  },

  getTransactionList: async (req, res) => {
    var eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    eth_address = eth_addresses[0].address;

    axios.get("http://api.etherscan.io/api?module=account&action=txlist&address=" + eth_address + "&startblock=0&endblock=99999999&sort=asc&apikey=DSH5B24BQYKD1AD8KUCDY3SAQSS6ZAU175").then(response => {
      res.send(response.data.result)
    }).catch(err => {
      res.send("Failed");
    });
  },

  getBitcoinTransactionList: async (req, res) => {
    var btc_address;
    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterBitcoin'
      }
    });
    btc_address = btc_addresses[0].address;
    console.log(btc_address)
    axios.get("https://blockchain.info/unspent?active=" + btc_address).then(response => {
      res.send(response.data.unspent_outputs)
    }).catch(err => {
      res.send("Failed");
    });
  }
}

function initiateTokenTransfer(user, project, amount, address, currencyType) {
  console.log("Token amount is ", amount);
  var newTokenTransferLog = new Object();
  // set the user's local credentials
  newTokenTransferLog.tokenAmount = amount;
  newTokenTransferLog.address = address;
  newTokenTransferLog.paymentMethod = currencyType;
  newTokenTransferLog.tokenTransferStatus = "Pending";
  tokenTransferLog.create(newTokenTransferLog).then(log => {
    console.log("New Transfer Log Created");
    user.addTokenTransferLog(log);
    project.addTokenTransferLog(log);
  });
}

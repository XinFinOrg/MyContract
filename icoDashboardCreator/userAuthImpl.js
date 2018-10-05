var db = require('../database/models/index');
var User = db.user;
const axios = require('axios');
var Address = db.userCurrencyAddress;
var fs = require('fs');
var configAuth = require('../config/auth');
const Binance = require('node-binance-api');
var coinPaymentHandler = require('../coinPayments/impl');
var icoListener = require('../icoHandler/listener');
module.exports = {

  getTransactions: async (req, res, next) => {
    var btc_address, eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Ethereum'
      }
    });
    eth_address = eth_addresses[0].address;

    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Bitcoin'
      }
    });
    btc_address = btc_addresses[0].address;
    var projectConfiguration = req.user.projectConfiguration;
    res.render('userTransactionHistory', {
      user: req.user,
      projectConfiguration: projectConfiguration,
      eth_address: eth_address,
      btc_address: btc_address
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
      res.render('userDashboard', {
        user: req.user,
        projectConfiguration: projectConfiguration,
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
      res.send({
        BTC: 1/ticker.ETHBTC,
        BTCUSD: ticker.BTCUSDT,
        ETHUSD: ticker.ETHUSDT
      });
    });
  },

  uploadKYC: (req, res, next) => {
    User.update({
      'kycDoc1': fs.readFileSync(req.files[0].path),
      'kycDoc2': fs.readFileSync(req.files[1].path),
      'kycDoc3': fs.readFileSync(req.files[2].path)
    }, {
      where: {
        'email': req.user.email,
        'projectConfigurationCoinName': req.user.projectConfiguration.coinName
      }
    }).then(() => {
      res.redirect('/user/dashboard');
    });
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
        currencyType: 'Ethereum'
      }
    });
    eth_address = eth_addresses[0].address;

    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Bitcoin'
      }
    });

    btc_address = btc_addresses[0].address;
    Promise.all([icoListener.checkTokenBalance(eth_address, req.user.projectConfiguration.tokenContractAddress), icoListener.checkBalance(eth_address), icoListener.checkBalance(btc_address)]).then(([tokenBalance, ethBalance, btcBalance]) => {
      res.send({
        'tokenBalance': tokenBalance,
        'balance': ethBalance,
        'btcBalance': btcBalance
      });
    });
  },

  buyToken: async (req, res) => {
    var eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Ethereum'
      }
    });
    eth_address = eth_addresses[0].address;

    var masterETHList = await req.user.projectConfiguration.getUserCurrencyAddresses({
      where: {
        currencyType: 'masterEthereum'
      }
    });
    var masterETHAddress = masterETHList[0].address;
    console.log(masterETHList);
    icoListener.buyToken(eth_address, masterETHAddress, eth_addresses[0].privateKey, req.body.amount)
    .then((receipt)=> {
        res.send({'receipt': receipt});
    });
  },

  buyTokenBTC: async (req, res) => {
    var btc_address;
    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Bitcoin'
      }
    });
    btc_address = btc_addresses[0].address;

    // var masterBTCList = await req.user.projectConfiguration.getUserCurrencyAddresses({
    //   where: {
    //     currencyType: 'masterBitcoin'
    //   }
    // });
    // var masterBTCAddress = masterBTCList[0].address;
    var bitcoinTransaction = require('bitcoin-transaction');
    //Send all my money from wallet1 to wallet2 on the bitcoin testnet
    var from = btc_address;
    // var to = masterBTCAddress;
    var privKeyWIF = btc_addresses[0].privateKey;
    bitcoinTransaction.sendTransaction({
  		from: from,
  		to: "3Hd5iUpWJw4yeAi5pGGADKw2AFAmYTSXAV",
  		privKeyWIF: privKeyWIF,
  		btc: req.body.amount,
  		network: "mainnet",
      fee: "fastest",
      dryrun: true
	  }).then(receipt => {
      console.log(receipt);
    });
  },

  checkTokenStats: (req, res) => {
    icoListener.checkTokenStats(req.user.projectConfiguration.tokenContractAddress).then(onSaleTokens => {
      res.send({'onSaleTokens': onSaleTokens});
    });
  },

  getTransactionList: async (req, res) => {
    var eth_address;
    var eth_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Ethereum'
      }
    });
    eth_address = eth_addresses[0].address;

    axios.get("http://api.etherscan.io/api?module=account&action=txlist&address="+eth_address+"&startblock=0&endblock=99999999&sort=asc&apikey=DSH5B24BQYKD1AD8KUCDY3SAQSS6ZAU175").then(response => {
      res.send(response.data.result)
    });
  },

  getBitcoinTransactionList: async (req, res) => {
    var btc_address;
    var btc_addresses = await req.user.getUserCurrencyAddresses({
      where: {
        currencyType: 'Bitcoin'
      }
    });
    btc_address = btc_addresses[0].address;
    axios.get("https://blockchain.info/unspent?active="+btc_address).then(response => {
      res.send(response.data.unspent_outputs)
    });
  }
}

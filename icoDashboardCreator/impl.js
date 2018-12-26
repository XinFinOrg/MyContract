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
var icoListener = require('../icoHandler/listener');
var mainnetListener = require('../icoHandler/etherMainNetworkHandler')
var privateListener = require('../icoHandler/privateNetworkHandler');
var testnetListener = require('../icoHandler/etherRopstenNetworkHandler');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
var config = require('../config/paymentListener');

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
    console.log(req.params, req.query, req.body)
    let userCount = await User.count({ where: { 'projectConfigurationCoinName': req.params.tokenName } })
    let verifiedUserCount = await User.count({ where: { 'projectConfigurationCoinName': req.params.tokenName, "kyc_verified": "active" } })
    let projectConfi = await ProjectConfiguration.find({ where: { 'coinName': req.params.tokenName } })
    let eth_address = await db.userCurrencyAddress.findAll({ where: { "client_id": req.user.uniqueId, "currencyType": "Ethereum", "project_id": req.params.tokenName }, raw: true, })
    let btc_address = await db.userCurrencyAddress.findAll({ where: { "client_id": req.user.uniqueId, "currencyType": "Bitcoin", "project_id": req.params.tokenName }, raw: true, })
    let transactionLog = await db.tokenTransferLog.findAll({ where: { 'project_id': req.params.tokenName }, raw: true });
    if (projectConfi.networkType == 'testnet') {
      console.log("in testnet"); await Promise.all([icoListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), testnetListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), testnetListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.send({
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.tokenName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      });
    } else if (projectConfi.networkType == 'mainnet') {
      console.log("in mainnet"); await Promise.all([icoListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), icoListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), icoListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.send({
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.tokenName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      });
    }
    else {
      console.log("in private");
      await Promise.all([icoListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), privateListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), privateListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.send({
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.tokenName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      })
    }
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
    if (req.files[0] == undefined) { projectdatavalues.siteLogo = null }
    else { projectdatavalues.siteLogo = await ImageDataURI.encodeFromFile(req.files[0].path) }
    projectdatavalues.siteName = req.body.siteName
    projectdatavalues.softCap = req.body.softCap
    projectdatavalues.hardCap = req.body.hardCap
    projectdatavalues.startDate = req.body.startDate
    projectdatavalues.endDate = req.body.endDate
    projectdatavalues.homeURL = req.body.homeURL
    projectdatavalues.minimumContribution = req.body.minimumContribution
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
          status: true,
          token: token
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
  tokenTrasfer: async function (req, res) {
    let projectConfi = await ProjectConfiguration.find({ where: { 'coinName': req.params.tokenName } })
    let accountData = await db.userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', 'project_id': req.params.tokenName } })
    try {
      if (projectConfi.networkType == 'testnet') {
        console.log("in testnet"); testnetListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(receipt => {
          res.send({ receipt: receipt });
        })
      }
      else if (projectConfi.networkType == 'mainnet') {
        console.log("in mainnet"); mainnetListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(receipt => {
          res.send({ receipt: receipt });
        })
      }
      else {
        console.log("in private"); privateListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(receipt => {
          res.send({ receipt: receipt });
        })
      }
    }
    catch (err) { console.log("in err", err) }
  },
  initiateTransferReq: async (req, res) => {
    console.log(req.body, req.params)
    let ids = []
    let address = [];
    let values = [];
    req.body.transactionId.forEach(element => {
      ids.push(element)
    });
    let projectdatavalues = await ProjectConfiguration.find({
      where: {
        "coinName": req.params.tokenName
      }
    })
    var accountData = await db.userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', "project_id": req.params.tokenName } })
    var tokenLogs = await db.tokenTransferLog.findAll({
      where: {
        "project_id": req.params.tokenName,
        uniqueId: {
          [Op.or]: ids
        }
      }, raw: true
    })

    var web3;
    if (projectdatavalues.networkType == 'testnet') {
      console.log("in testnet"); web3 = new Web3(new Web3.providers.WebsocketProvider(config.testnetProvider))
      await Promise.all([testnetListener.checkTokenStats(projectdatavalues.tokenContractAddress, new Web3.providers.WebsocketProvider(config.testnetProvider))]).then(([decimals]) => {
        for (let index = 0; index < tokenLogs.length; index++) {
          address.push(tokenLogs[index].address);
          values.push('0x' + ((tokenLogs[index].tokenAmount * 10 ** (decimals)) * projectdatavalues.ETHRate).toString(16))
        }
      })
      var escrowAbi = [{ "constant": false, "inputs": [{ "name": "_value", "type": "bool" }], "name": "updateBounsStatus", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "rate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "weiRaised", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "wallet", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "updateBounsRate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "bonusRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "updateTokenPrice", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isBonusOn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_investor", "type": "address" }, { "name": "_tokens", "type": "uint256" }], "name": "sendTokensToInvestors", "outputs": [{ "name": "ok", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "stopCrowdSale", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_addresses", "type": "address[]" }, { "name": "_value", "type": "uint256[]" }], "name": "dispenseTokensToInvestorAddressesByValue", "outputs": [{ "name": "ok", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }], "name": "buyTokens", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "startCrowdSale", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "rate", "type": "uint256" }, { "name": "bonusRate", "type": "uint256" }, { "name": "wallet", "type": "address" }, { "name": "token", "type": "address" }, { "name": "isBonusOn", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "purchaser", "type": "address" }, { "indexed": true, "name": "beneficiary", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TokensPurchased", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "beneficiary", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TokensPurchased", "type": "event" }]
      console.log(values, address, accountData.privateKey);
      var contractfunc = new web3.eth.Contract(escrowAbi, projectdatavalues.crowdsaleContractAddress, { from: accountData.address });
      let data = contractfunc.methods.dispenseTokensToInvestorAddressesByValue(address, values).encodeABI()
      var mainPrivateKey = new Buffer(accountData.privateKey.replace("0x", ""), 'hex')
      let txData = {
        "nonce": await web3.eth.getTransactionCount(accountData.address),
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x2dc6c0",
        "to": projectdatavalues.crowdsaleContractAddress,
        "value": "0x0",
        "data": data,
        "chainId": 3
      }
      var tx = new Tx(txData);
      tx.sign(mainPrivateKey);
      var serializedTx = tx.serialize();
      try {
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('confirmation', async function (confirmationNumber, receipt) {
            if (confirmationNumber == 1) {
              console.log(confirmationNumber, receipt);
              await db.tokenTransferLog.update({ tokenTransferStatus: "Transferred", transaction_hash: receipt.transactionHash }, { where: { uniqueId: { [Op.or]: ids } } });
              res.send({ receipt: receipt, message: true });
            }
          })
          .on('error', function (error) { res.send({ receipt: error, message: false }); })

      }
      catch (err) { console.log("in err") }
    }
    else if (projectdatavalues.networkType == 'mainnet') {
      console.log("in testnet"); web3 = new Web3(new Web3.providers.WebsocketProvider(config.ws_provider))
      await Promise.all([testnetListener.checkTokenStats(projectdatavalues.tokenContractAddress, new Web3.providers.WebsocketProvider(config.testnetProvider))]).then(([decimals]) => {
        for (let index = 0; index < tokenLogs.length; index++) {
          address.push(tokenLogs[index].address);
          values.push('0x' + ((tokenLogs[index].tokenAmount * 10 ** (decimals)) * projectdatavalues.ETHRate).toString(16))
        }
      })
      var escrowAbi = [{ "constant": false, "inputs": [{ "name": "_value", "type": "bool" }], "name": "updateBounsStatus", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "rate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "weiRaised", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "wallet", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "updateBounsRate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "bonusRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "updateTokenPrice", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isBonusOn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_investor", "type": "address" }, { "name": "_tokens", "type": "uint256" }], "name": "sendTokensToInvestors", "outputs": [{ "name": "ok", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "stopCrowdSale", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_addresses", "type": "address[]" }, { "name": "_value", "type": "uint256[]" }], "name": "dispenseTokensToInvestorAddressesByValue", "outputs": [{ "name": "ok", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }], "name": "buyTokens", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "startCrowdSale", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "rate", "type": "uint256" }, { "name": "bonusRate", "type": "uint256" }, { "name": "wallet", "type": "address" }, { "name": "token", "type": "address" }, { "name": "isBonusOn", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "purchaser", "type": "address" }, { "indexed": true, "name": "beneficiary", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TokensPurchased", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "beneficiary", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TokensPurchased", "type": "event" }]
      console.log(values, address, accountData.privateKey);
      var contractfunc = new web3.eth.Contract(escrowAbi, projectdatavalues.crowdsaleContractAddress, { from: accountData.address });
      let data = contractfunc.methods.dispenseTokensToInvestorAddressesByValue(address, values).encodeABI()
      var mainPrivateKey = new Buffer(accountData.privateKey.replace("0x", ""), 'hex')
      let txData = {
        "nonce": await web3.eth.getTransactionCount(accountData.address),
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x2dc6c0",
        "to": projectdatavalues.crowdsaleContractAddress,
        "value": "0x0",
        "data": data,
        "chainId": 3
      }
      var tx = new Tx(txData);
      tx.sign(mainPrivateKey);
      var serializedTx = tx.serialize();
      try {
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('confirmation', async function (confirmationNumber, receipt) {
            if (confirmationNumber == 1) {
              console.log(confirmationNumber, receipt);
              await db.tokenTransferLog.update({ tokenTransferStatus: "Transferred", transaction_hash: receipt.transactionHash }, { where: { uniqueId: { [Op.or]: ids } } });
              res.send({ receipt: receipt, message: true });
            }
          })
          .on('error', function (error) { res.send({ receipt: error, message: false }); })

      }
      catch (err) { console.log("in err") }
    }
    else {
      privateListener.checkTokenStats(projectdatavalues.tokenContractAddress).then(async decimals => {
        for (let index = 0; index < tokenLogs.length; index++) {
          address.push(tokenLogs[index].address);
          values.push((tokenLogs[index].tokenAmount * 10 ** (decimals)) * projectdatavalues.ETHRate)
        }
        console.log(tokenLogs.length)
        for (let index = 0; index < tokenLogs.length; index++) {
          await privateListener.sendTokenFromTokenContract(projectdatavalues.dataValues, accountData.address, values[index], address[index], accountData.privateKey).then(async receipt => {
            await db.tokenTransferLog.update({ tokenTransferStatus: "Transferred", transaction_hash: receipt.transactionHash }, { where: { uniqueId: { [Op.or]: ids } } });
          })
        }
        res.send({ message: true });
      })
    }
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

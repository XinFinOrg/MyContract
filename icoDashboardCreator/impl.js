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
var icoListener = require('../icoHandler/listener');
var mainnetListener = require('../icoHandler/etherMainNetworkHandler')
var privateListener = require('../icoHandler/privateNetworkHandler');
var testnetListener = require('../icoHandler/etherRopstenNetworkHandler');
var config = require('../config/paymentListener');
var Tx = require('ethereumjs-tx');
var Web3 = require('web3');
// var ws_provider = config.ws_provider;
// var provider = new Web3.providers.WebsocketProvider(config.testnetProvider);
// let provider = new Web3(new Web3.providers.HttpProvider(config.privateProvider));
// var web3 = new Web3(provider);
const Sequelize = require('sequelize');
const Op = Sequelize.Op


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

  updateColor: async function (res, req) {
    // console.log('in hererererererer')
    console.log(req.query, req.body, req.params)
    res.send({ "sad": "fdf" })
  },
  icoDashboardSetup: async function (req, res) {
    let userCount = await User.count({ where: { 'projectConfigurationCoinName': req.params.projectName } })
    let verifiedUserCount = await User.count({ where: { 'projectConfigurationCoinName': req.params.projectName, "kyc_verified": "active" } })
    let projectConfi = await ProjectConfiguration.find({ where: { 'coinName': req.params.projectName } })
    let eth_address = await db.userCurrencyAddress.findAll({ where: { "client_id": req.user.uniqueId, "currencyType": "Ethereum", "project_id": req.params.projectName }, raw: true, })
    let btc_address = await db.userCurrencyAddress.findAll({ where: { "client_id": req.user.uniqueId, "currencyType": "Bitcoin", "project_id": req.params.projectName }, raw: true, })
    let transactionLog = await db.tokenTransferLog.findAll({ where: { 'project_id': req.params.projectName }, raw: true });
    if (projectConfi.networkType == 'testnet') {
      console.log("in testnet"); await Promise.all([icoListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), testnetListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), testnetListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.render('icoDashboard', {
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.projectName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      });
    }
    else if (projectConfi.networkType == 'mainnet'){
      console.log("in mainnet xinfin");
      await Promise.all([privateListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), privateListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), privateListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.render('icoDashboard', {
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.projectName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      })
    }
    else{
      console.log("in mainnet"); await Promise.all([icoListener.checkEtherBalance(eth_address[0].address), icoListener.checkBalance(btc_address[0].address), icoListener.checkTokenBalance(projectConfi.tokenContractAddress, projectConfi.tokenContractAddress), icoListener.checkTokenBalance(projectConfi.crowdsaleContractAddress, projectConfi.tokenContractAddress)]).then(([ethBalance, btcBalance, tokenBalance, crowdsaleBalance]) => {
        res.render('icoDashboard', {
          'ethBalance': ethBalance,
          'btcBalance': btcBalance,
          'user': req.user,
          'projectName': req.params.projectName,
          'userCount': userCount,
          'verifiedUserCount': verifiedUserCount,
          'transactionLog': transactionLog,
          'tokenBalance': tokenBalance,
          'crowdsaleBalance': crowdsaleBalance
        });
      });
    }
    
  },
  tokenTrasfer: async function (req, res) {
    let projectConfi = await ProjectConfiguration.find({ where: { 'coinName': req.params.projectName } })
    let accountData = await db.userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', 'project_id': req.params.projectName } })
    try {
      if (projectConfi.networkType == 'testnet') {
        console.log("in testnet"); testnetListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(() => {
          res.redirect('/icoDashboard/icoDashboardSetup/project/' + req.params.projectName);
        })
      }
      else if (projectConfi.networkType == 'mainnet') {
        console.log("in mainnet"); mainnetListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(() => {
          res.redirect('/icoDashboard/icoDashboardSetup/project/' + req.params.projectName);
        })
      }
      else {
        console.log("in private"); privateListener.sendTokenFromTokenContract(projectConfi.dataValues, accountData.address, req.body.tokenAmount, req.body.tokenAddress, accountData.privateKey).then(() => {
          res.redirect('/icoDashboard/icoDashboardSetup/project/' + req.params.projectName);
        })
      }
    }
    catch (err) { console.log("in err", err) }
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
        exclude: ['coinName', 'ETHRate', 'tokenContractCode', 'tokenABICode', 'crowdsaleABICode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
      }
    }).then(values => {
      if (!values) {
        res.send({
          message: "null!"
        });
      } else {
        res.send({
          data: values.dataValues,
          message: "updated!",
          Buffer: values.dataValues.siteLogo
        })
      }
    })
  },
  updateSiteConfiguration: async function (req, res) {
    var projectdatavalues = await ProjectConfiguration.find({
      where: {
        "coinName": req.params.projectName
      }
    })
    if (req.files[0] != undefined)
      projectdatavalues.siteLogo = await ImageDataURI.encodeFromFile(req.files[0].path).catch(function (err) {
        res.render("error", { error: err, message: "unable to update!" })
      });
    projectdatavalues.siteName = req.body.site_name
    projectdatavalues.softCap = req.body.soft_cap
    projectdatavalues.hardCap = req.body.hard_cap
    projectdatavalues.startDate = req.body.start_date
    projectdatavalues.endDate = req.body.end_date
    projectdatavalues.homeURL = req.body.website_url
    projectdatavalues.minimumContribution = req.body.minimum_contribution
    projectdatavalues.save({ returning: false }).then(() => {
      console.log("Project updated successfully!");
      res.redirect("/icoDashboard/siteConfiguration/project/" + req.params.projectName)
    })
      .catch(function (err) {
        res.render("error", { error: err, message: "unable to update!" })
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
      element.dataValues.link = "<a href='/icoDashboard/icoDashboardSetup/project/" + req.params.projectName + "/kyctab/" + element.dataValues.uniqueId + "/getUserData'>click Here</a>"
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
      console.log("done")
      res.render("adminKYCpanel.ejs", {
        KYCdata: userdata,
        projectName: req.params.projectName
      })
    })
  },
  updateUserData: async function (req, res) {
    // console.log(req.body,"HEER")
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
    res.redirect("/icoDashboard/icoDashboardSetup/project/" + req.params.projectName + "/kyctab")
  },

  contractData: async function (req, res) {
    ProjectConfiguration.find({
      where: {
        'coinName': req.params.projectName,
        'client_id': req.user.uniqueId
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
    ProjectConfiguration.find({
      where: {
        coinName: req.params.projectName
      }
    }).then(project => {
      if (project) {
        res.render("userLogin.ejs", {
          projectName: req.params.projectName,
          message: req.flash('signupMessage')
        });
      }
      else {
        res.send("404 Not Found");
      }
    })
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
          req.flash('error','Something went wrong please try again later.')
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
        req.flash('error','Something went wrong please try again later.')
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
      console.log(user,"userrrrrrrrr");
      try {
        if (err || !user) {
          req.flash('error','Some error occurred during Signup,please try again after sometime.')
          return res.redirect('./userSignup');
        }
        // req.flash('success','Please check your email address and verified your email address to activate your account.')
        return res.redirect('./userLogin');
      } catch (error) {
        req.flash('error','Something went wrong please try again later.')
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
        req.flash('success','Email verified successfully.')
        res.redirect('./' + user.projectConfigurationCoinName + '/userLogin');
      });
    });
  },
  getTransaction: async (req, res) => {
    transactionLog = await db.tokenTransferLog.findAll(
      { where: { 'project_id': req.params.projectName }, raw: true }
    );
    // console.log(transactionLog)
    res.render("transaction.ejs", {
      user: req.user,
      projectName: req.params.projectName,
      transactionLog: transactionLog
    });
  },
  initiateTransferReq: async (req, res) => {
    let ids = []
    let address = [];
    let values = [];
    if (Array.isArray(req.body['accounts[]'])) {
      req.body['accounts[]'].forEach(element => {
        ids.push(element)
      });
    } else {
      ids.push(req.body['accounts[]'])
    }
    let projectdatavalues = await ProjectConfiguration.find({
      where: {
        "coinName": req.params.projectName
      }
    })
    var accountData = await db.userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', "project_id": req.params.projectName } })
    var tokenLogs = await db.tokenTransferLog.findAll({
      where: {
        "project_id": req.params.projectName,
        uniqueId: {
          [Op.or]: ids
        }
      }, raw: true
    })
    // if (projectdatavalues.networkType == "mainnet") {
    //   await Promise.all([icoListener.checkTokenStats(projectdatavalues.tokenContractAddress, new Web3.providers.WebsocketProvider(config.testnetProvider))]).then(([decimals]) => {
    //     for (let index = 0; index < tokenLogs.length; index++) {
    //       address.push(tokenLogs[index].address);
    //       values.push('0x' + ((tokenLogs[index].tokenAmount * 10 ** (decimals)) * projectdatavalues.ETHRate).toString(16))
    //     }
    //   })
    //   //   mainnetListener.sendTokenFromcrowdsaleContract(projectdatavalues.dataValues, accountData.address, values, address, accountData.privateKey).then(async receipt => {
    //   //     await db.tokenTransferLog.update({ tokenTransferStatus: "Transferred", transaction_hash: receipt.transactionHash }, { where: { uniqueId: { [Op.or]: ids } } });
    //   //     res.send({ message: true });
    //   //   })
    // }
    // else if (projectdatavalues.networkType == "testnet") {
    //   await Promise.all([testnetListener.checkTokenStats(projectdatavalues.tokenContractAddress, new Web3.providers.WebsocketProvider(config.testnetProvider))]).then(([decimals]) => {
    //     for (let index = 0; index < tokenLogs.length; index++) {
    //       address.push(tokenLogs[index].address);
    //       values.push('0x' + ((tokenLogs[index].tokenAmount * 10 ** (decimals)) * projectdatavalues.ETHRate).toString(16))
    //     }
    //   })
    //   // testnetListener.sendTokenFromcrowdsaleContract(projectdatavalues.dataValues, accountData.address, values, address, accountData.privateKey).then(async receipt => {
    //   //   await db.tokenTransferLog.update({ tokenTransferStatus: "Transferred", transaction_hash: receipt.transactionHash }, { where: { uniqueId: { [Op.or]: ids } } });
    //   //   res.send({ message: true });
    //   // })
    // }
    var web3;
    if (projectdatavalues.networkType == 'testnet') {
      console.log("in testnet"); web3 = new Web3(new Web3.providers.WebsocketProvider(config.testnetProvider))
      await Promise.all([testnetListener.checkTokenStats(projectdatavalues.tokenContractAddress, new Web3.providers.WebsocketProvider(config.testnetProvider))]).then(([decimals]) => {
        for (let index = 0; index < tokenLogs.length; index++) {
          address.push(tokenLogs[index].address);
          values.push('0x' + ((tokenLogs[index].tokenAmount + 10 ** (decimals))).toString(16))
        }
      })
      console.log("vlaues",values);
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
          values.push('0x' + ((tokenLogs[index].tokenAmount + 10 ** (decimals))).toString(16))
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
          values.push('xdc'+(tokenLogs[index].tokenAmount * 10 ** (decimals)).toString(16))
        }
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

var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
var userCurrencyAddress = db.userCurrencyAddress;
var ejs = require("ejs");
var fileReader = require('../filereader/impl');
var config = require('../config/paymentListener');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');
var ws_provider = config.ws_provider;
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);

module.exports = {
  getBytecode: async function (req, res) {
    var coinName = req.query.coinName;
    var address = req.cookies['address'];
    ProjectConfiguration.find({
      where: {
        'coinName': coinName
      },
      attributes: ['coinName', 'bonusRate', 'bonusStatus', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash', 'crowdsaleABICode', 'tokenABICode']
    }).then(async projectData => {
      if (projectData.tokenContractAddress != null) {
        byteCode = projectData.crowdsaleByteCode;
        if (byteCode == null) {
          // console.log(projectData.ETHRate, projectData.bonusRate=="" ? 0:projectData.bonusRate, address, projectData.tokenContractAddress, projectData.bonusStatus,"hello");
          byteCode = await solc.compile(projectData.crowdsaleContractCode, 1).contracts[':Crowdsale'];
          byteCode.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, address, projectData.tokenContractAddress, projectData.bonusStatus]).slice(2)
          projectData.crowdsaleByteCode = byteCode.bytecode;
          projectData.crowdsaleABICode = byteCode.interface;
          byteCode = byteCode.bytecode
          await projectData.save();
        }
      } else {
        byteCode = projectData.tokenByteCode;
        if (byteCode == null) {
          byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']    //solc.compile(projectData.tokenContractCode, 1).contracts[':Coin'].bytecode;
          projectData.tokenByteCode = byteCode.bytecode;
          projectData.tokenABICode = byteCode.interface;
          byteCode = byteCode.bytecode
          await projectData.save();
        }
      }
      res.send({
        bytecode: byteCode
      })
    });
  },
  saveDeploymentData: async function (req, res) {
    ProjectConfiguration.find({
      where: {
        'coinName': req.query.coinName
      },
      attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
    }).then(async updateddata => {
      if (req.body.network.search("https://etherscan.io") != -1) {
        updateddata.networkType = "mainnet";
      } else {
        updateddata.networkType = "testnet"
      }
      updateddata.networkURL = req.body.network;
      if (updateddata.tokenContractAddress == null) {
        updateddata.tokenContractHash = req.body.contractTxHash;
        updateddata.tokenContractAddress = req.body.contractAddress;
        updateddata.save();
        req.session.contractAddress = req.body.contractAddress;
        req.session.contractTxHash = req.body.contractTxHash;
        req.flash('contract_flash', 'Contract mined successfully!');
        req.session.coinName = req.query.coinName;
        res.send("generatedCrowdsaleContract");
      } else {
        updateddata.crowdsaleContractHash = req.body.contractTxHash;
        updateddata.crowdsaleContractAddress = req.body.contractAddress;
        updateddata.save();
        req.session.contractAddress = req.body.contractAddress;
        req.session.contractTxHash = req.body.contractTxHash;
        res.send("dashboard");
      }
    })
  },
  generatedContract: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    ProjectConfiguration.find({
      where: {
        'coinName': req.session.coinName
      },
      attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
    }).then(async projectData => {
      var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
      var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
      var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
      ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
        "SafeERC20": SafeERC20,
        "SafeMath": SafeMath,
        "IERC20": IERC20,
      }, async (err, data) => {
        if (err)
          console.log(err);
        projectData.crowdsaleContractCode = data;
        await projectData.save();
        res.render('deployedContract', {
          message1: "",
          user: req.user,
          address: address,
          contract: data,
          ProjectConfiguration: projectArray,
          coinName: req.session.coinName
        });
      })
    })
  },

  crowdsaleDeployer: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'crowdsaleDeployer.ejs'), {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
  },

  getDeployer: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    if (req.query.coinName == null) {
      res.render(path.join(__dirname, './', 'dist', 'index.ejs'), {
        user: req.user,
        address: address,
        ProjectConfiguration: projectArray,
      });
    } else {
      req.session.coinName = req.query.coinName;
      res.redirect("/generatedCrowdsaleContract");
    }
  },

  getAutomaticDeployer: async function (req, res) {
    var address = req.cookies['address'];
    console.log(req.query) // network: 'test', coinName: 'pilankarcoin' 
    let projectData = await ProjectConfiguration.find({ where: { 'coinName': req.session.coinName } });
    let accountData = await userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum' } })
    if (projectData.tokenByteCode == null) {
      byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
      projectData.tokenByteCode = byteCode.bytecode;
      projectData.tokenABICode = byteCode.interface;
      byteCode = byteCode.bytecode
      await projectData.save();
    }
    if (req.query.network == "test") {
      let provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
      let web3 = new Web3(provider);
      var privateKey = new Buffer(accountData.privateKey, 'hex')
      let txData = {
        "nonce": await web3.eth.getTransactionCount(address),
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x2dc6c0",
        "to": "", "value": "0x00",
        "data": projectData.tokenByteCode,
        "chainId": 3
      }
      var tx = new Tx(txData);
      tx.sign(privateKey);
      var serializedTx = tx.serialize();
      console.log("in here")
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', function (receipt) { res.send(receipt) });
    } else {
      let provider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws');
      let web3 = new Web3(provider);
      var privateKey = new Buffer('', 'hex')
      // let txData = {
      //   "nonce": await web3.eth.getTransactionCount(address),
      //   "gasPrice": "0x170cdc1e00",
      //   "gasLimit": "0x2dc6c0",
      //   "to": "", "value": "0x00",
      //   "data": req.body.data, "chainId": 3
      // }
      let txData
      var tx = new Tx(txData);
      tx.sign(privateKey);
      var serializedTx = tx.serialize();
      console.log("in here")
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', function (receipt) { res.send(receipt) });
    }
  },

  test: async function (req, res) {
    //console.log(req.query) // network: 'test', coinName: 'pilankarcoin' 
    let projectData = await ProjectConfiguration.find({ where: { 'coinName': 'pilankarcoin' } });
    let accountData = await userCurrencyAddress.find({ where: { 'client_id': '9cdeae50-d458-11e8-a2ce-5d8d68895880', 'currencyType': 'Ethereum' } })
    console.log(projectData.dataValues, accountData.dataValues)
    byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
    projectData.tokenByteCode = byteCode.bytecode;
    projectData.tokenABICode = byteCode.interface;
    res.send(projectData.tokenByteCode);
  //   let provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
  //   let web3 = new Web3(provider);
  //   var privateKey = new Buffer('25F8170BA33240C0BD2C8720FE09855ADA9D07E38904FC5B6AEDCED71C0A3142', 'hex')
  //   let txData = {
  //     "nonce": await web3.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
  //     "gasPrice": "0x170cdc1e00",
  //     "gasLimit": "0x2dc6c0",
  //     "to": "",
  //     "value": "0x00",
  //     "data": byteCode.bytecode,
  //     "chainId": 3
  //   }
  //   var tx = new Tx(txData);
  //   tx.sign(privateKey);
  //   var serializedTx = tx.serialize();
  //   console.log("in here")
  //   web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
  //     .on('receipt', async function (receipt) {
  //       projectData.tokenContractAddress = receipt.contractAddress;
  //       projectData.tokenContractHash = receipt.transactionHash;
  //       await projectData.save();
  //       res.send(receipt);
  //     });
  },
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

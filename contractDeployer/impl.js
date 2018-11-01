var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var byteCode2;
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
  contractCompiler: async function (req, res) {
    let compiledData
    ProjectConfiguration.find({
      where: {
        'coinSymbol': req.body.coinSymbol
      },
      attributes: ['coinName', 'bonusRate', 'bonusStatus', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash', 'crowdsaleABICode', 'tokenABICode']
    }).then(async projectData => {
      if (projectData.tokenContractAddress != null) {
        compiledData = projectData.crowdsaleByteCode;
        if (compiledData == null) {
          compiledData = await solc.compile(projectData.crowdsaleContractCode, 1).contracts[':Crowdsale'];
          compiledData.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, address, projectData.tokenContractAddress, projectData.bonusStatus]).slice(2)
          projectData.crowdsaleByteCode = compiledData.bytecode;
          projectData.crowdsaleABICode = compiledData.interface;
          await projectData.save();
        }
      } else {
        compiledData = projectData.tokenByteCode;
        if (compiledData == null) {
          compiledData = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']    //solc.compile(projectData.tokenContractCode, 1).contracts[':Coin'].bytecode;
          projectData.tokenByteCode = compiledData.bytecode;
          projectData.tokenABICode = compiledData.interface;
          await projectData.save();
        }
      }
      res.send({
        "bytecode": compiledData.bytecode,
        "interface": compiledData.interface
      })
    })
  },
  getAutomaticDeployer: async function (req, res) {
    let provider, chainId ,receipt1, receipt2
    let projectData = await ProjectConfiguration.find({ where: { 'coinSymbol': req.body.coinSymbol } });
    let accountData = await userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum' } })

    //network check
    if (req.body.networkType == "mainnet") {
      provider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws');
      projectData.networkType = "mainnet";
      chainId = 1
    } else {
      provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
      projectData.networkType = "testnet";
      chainId = 3
    }
    let web3 = new Web3(provider);
    console.log( await web3.eth.getBlockNumber());
    projectData.crowdsaleContractAddress = "Deployment is in process";
    projectData.tokenContractAddress = "Deployment is in process";
    projectData.networkURL = "#"
    await projectData.save();
    if (req.body.networkType == "testnet") {
     await Promise.all([isTestnet(config.testnetFaucetAddress, config.testnetFaucetPrivatekey, accountData.address,web3)]).then(async ([status]) => {
        if (status == false) {
          projectData.crowdsaleContractAddress = "Network error occured! Please try again";
          projectData.tokenContractAddress = "Network error occured! Please try again";
          await projectData.save();
          res.status(505).end("Network error occured! Please try again");
        }
      })
    }
    byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
    projectData.tokenByteCode = byteCode.bytecode;
    projectData.tokenABICode = byteCode.interface;
    var privateKey = new Buffer(accountData.privateKey.replace("0x", ""), 'hex')
    let txData = {
      "nonce": await web3.eth.getTransactionCount(accountData.address),
      "gasPrice": "0x170cdc1e00",//await web3.eth.getGasPrice(),
      "gasLimit": "0x2dc6c0",
      "to": "",
      "value": "0x00",
      "data": '0x' + byteCode.bytecode,
      "chainId": chainId
    }
    var tx = new Tx(txData);
    tx.sign(privateKey);
    var serializedTx = tx.serialize();
    console.log("in here")
    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('receipt', async function (receipt) {
        if (receipt.status == false) {
          projectData.crowdsaleContractAddress = "Network error occured! Please try again";
          projectData.tokenContractAddress = "Deployment is in process!  Please try again";
          await projectData.save();
          res.status(505).end();
        } else {
          receipt1 = receipt
          projectData.tokenContractAddress = receipt.contractAddress;
          projectData.tokenContractHash = receipt.transactionHash;
          var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
          var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
          var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
          ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
            "SafeERC20": SafeERC20,
            "SafeMath": SafeMath,
            "IERC20": IERC20,
          }, async (err, data) => {
            byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
            byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', receipt.contractAddress, projectData.bonusStatus]).slice(2)
            projectData.crowdsaleByteCode = byteCode2.bytecode;
            projectData.crowdsaleABICode = byteCode2.interface;
            let txData = {
              "nonce": await web3.eth.getTransactionCount(accountData.address),
              "gasPrice":"0x170cdc1e00",//await web3.eth.getGasPrice(),
              "gasLimit": "0xD19A9",
              "to": "",
              "value": "0x00",
              "data": '0x' + byteCode2.bytecode,
              "chainId": chainId
            }
            var tx = new Tx(txData);
            tx.sign(privateKey);
            var serializedTx = tx.serialize();
            console.log("in here")
            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
              .on('receipt', async function (receipt) {
                if (receipt.status == false) {
                  projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                  projectData.tokenContractAddress = "Deployment is in process!  Please try again";
                  res.status(505).end();
                } else {
                  receipt2 = receipt
                  projectData.crowdsaleContractHash = receipt.transactionHash;
                  projectData.crowdsaleContractAddress = receipt.contractAddress;
                  await projectData.save();
                  res.status(200).send({"status":"success","receipt1":receipt1,"receipt2":receipt2});
                }
              })
              .on('error', async function (receipt) {
                console.log(receipt)
                // projectData.crowdsaleContractAddress = receipt;
                // projectData.tokenContractAddress = receipt;
                // await projectData.save();
                res.status(505).end();
              })
          })
        }
      })
      .on('error', async function (receipt) {
        console.log(receipt)
        // projectData.crowdsaleContractAddress = receipt;
        // projectData.tokenContractAddress = receipt;
        // await projectData.save();
        res.status(505).end();
      })
  },
};

async function isTestnet(testnetFaucetAddress, testnetFaucetPrivatekey, receiverAddress,web3) {
  return new Promise(async function (resolve, reject) {
    provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
    chainId = 3
    let web3 = new Web3(provider);
    var mainPrivateKey = new Buffer(testnetFaucetPrivatekey, 'hex')
    let txData = {
      "nonce": await web3.eth.getTransactionCount(testnetFaucetAddress),
      "gasPrice":"0x170cdc1e00",
      "gasLimit": "0x52080",
      "to": receiverAddress,
      "value": "0x06f05b59d3b20000",
      "data": '0x',
      "chainId": 3
    }
    var tx = new Tx(txData);
    tx.sign(mainPrivateKey);
    var serializedTx = tx.serialize();
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
      .on('confirmation', async function (confirmationNumber, receipt) {
        if (confirmationNumber == 5) {
          console.log("in here",confirmationNumber);
          if (receipt.status == true)
            resolve(receipt.status);
          reject(receipt.status);
        }
      })
      .on('error', async function (receipt) {
        reject(receipt.status);
      })
  });
}


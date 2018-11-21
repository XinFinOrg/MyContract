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
var nodemailerservice = require('../emailer/impl');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');

module.exports = {
  getBytecode: async function (req, res) {
    var coinName = req.query.coinName;
    var address = req.cookies['address'];
    let eth_address = await db.userCurrencyAddress.findAll({ where: { "client_id": req.user.uniqueId, "currencyType": "masterEthereum" }, raw: true, })
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
          byteCode.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, eth_address[0].address, projectData.tokenContractAddress, projectData.bonusStatus]).slice(2)
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
        nodemailerservice.sendContractEmail(req.user.email, data, req.session.coinName, "Crowdsale Contract");
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
    let projectData = await ProjectConfiguration.find({ where: { 'coinName': req.query.coinName } });
    let accountData = await userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'masterEthereum', 'project_id': req.query.coinName } })
    projectData.crowdsaleContractAddress = "Deployment is in process";
    projectData.tokenContractAddress = "Deployment is in process";
    projectData.networkType = req.query.network;
    projectData.networkURL = "#"
    await projectData.save();
    res.redirect('/')
    await Promise.all([getWeb3Provider(req.query.network, accountData)]).then(async ([provider]) => {
      console.log('working')
      //token deployment
      let web3 = provider;
      byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
      projectData.tokenByteCode = byteCode.bytecode;
      projectData.tokenABICode = byteCode.interface;
      let txData = {
        "nonce": await web3.eth.getTransactionCount(accountData.address),
        "data": '0x' + byteCode.bytecode,
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x2dc6c0",
      }
      web3.eth.accounts.signTransaction(txData, accountData.privateKey).then(result => {
        web3.eth.sendSignedTransaction(result.rawTransaction)
          .on('receipt', async function (receipt) {
            if (receipt.status == false) {
              projectData.crowdsaleContractAddress = "Network error occured! Please try again";
              projectData.tokenContractAddress = "Network error occured! Please try again";
              await projectData.save();
            } else {
              //crowdsale deployment
              console.log(receipt)
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
                nodemailerservice.sendContractEmail(req.user.email, data, req.query.coinName, "Crowdsale Contract");
                byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', receipt.contractAddress, projectData.bonusStatus]).slice(2)
                projectData.crowdsaleByteCode = byteCode2.bytecode;
                projectData.crowdsaleABICode = byteCode2.interface;
                let txData = {
                  "nonce": await web3.eth.getTransactionCount(accountData.address),
                  "data": '0x' + byteCode2.bytecode,
                  "gasPrice": "0x170cdc1e00",
                  "gasLimit": "0xD19A9",
                }
                web3.eth.accounts.signTransaction(txData, accountData.privateKey).then(result => {
                  web3.eth.sendSignedTransaction(result.rawTransaction)
                    .on('receipt', async function (receipt) {
                      if (receipt.status == false) {
                        projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                        projectData.tokenContractAddress = "Network error occured! Please try again";
                        await projectData.save();
                      } else {
                        console.log(receipt)
                        projectData.crowdsaleContractHash = receipt.transactionHash;
                        projectData.crowdsaleContractAddress = receipt.contractAddress;
                        await projectData.save();
                      }
                    })
                    .on('error', async function (receipt) {
                      projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                      projectData.tokenContractAddress = "Network error occured! Please try again";
                      await projectData.save();
                    })
                })
              })
            }
          })
          .on('error', async function (receipt) {
            projectData.crowdsaleContractAddress = "Network error occured! Please try again";
            projectData.tokenContractAddress = "Network error occured! Please try again";
            await projectData.save();
          })
      })
    })
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

function getWeb3Provider(provider, accountData) {
  console.log(provider, 'in here')
  return new Promise(async function (resolve, reject) {
    console.log('in here 1')
    if (provider == 'testNet') {
      console.log('in here testnet')
      var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
      var mainPrivateKey = '0x25F8170BA33240C0BD2C8720FE09855ADA9D07E38904FC5B6AEDCED71C0A3142';
      var txData = {
        "nonce": await web3.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
        "to": accountData.address,
        "value": "0x06f05b59d3b20000",
      }
      web3.eth.estimateGas(txData).then(gasLimit => {
        txData["gasLimit"] = gasLimit;
        web3.eth.accounts.signTransaction(txData, mainPrivateKey).then(result => {
          web3.eth.sendSignedTransaction(result.rawTransaction)
            .on('confirmation', async function (confirmationNumber, receipt) {
              if (confirmationNumber == 3) {
                if (receipt.status == true) {
                  console.log(receipt);
                  resolve(new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws')))
                }
              }
            })
        })
      })
    } else if (provider == 'private') {
      console.log('in here private')
      var web3 = new Web3(new Web3.providers.HttpProvider(config.privateProvider));
      var mainPrivateKey = '0xdf11b6debfa783dbc46afd4d753a6dc39caa785c1b3e749f087fc1d4f0552f6c';
      var txData = {
        "nonce": await web3.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
        "to": accountData.address,
        "value": "0x06f05b59d3b20000",
      }
      web3.eth.estimateGas(txData).then(gasLimit => {
        txData["gasLimit"] = gasLimit;
        web3.eth.accounts.signTransaction(txData, mainPrivateKey).then(result => {
          web3.eth.sendSignedTransaction(result.rawTransaction)
            .on('receipt', async function (receipt) {
              if (receipt.status == true) {
                resolve(new Web3(new Web3.providers.HttpProvider(config.privateProvider)))
              }
            })
        })
      })
    } else {
      resolve(new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws')))
    }
  })
}
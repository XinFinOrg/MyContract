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
var ws_provider = config.ws_provider;
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);

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
    if (req.query.network != 'test') {
      console.log('test')
      let provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
      let web3 = new Web3(provider);
      console.log(accountData.address)
      projectData.crowdsaleContractAddress = "Deployment is in process";
      projectData.tokenContractAddress = "Deployment is in process";
      projectData.networkType = "testnet";
      projectData.networkURL = "#"
      await projectData.save();
      res.redirect('/');
      var mainPrivateKey = new Buffer('25F8170BA33240C0BD2C8720FE09855ADA9D07E38904FC5B6AEDCED71C0A3142', 'hex')
      let txData = {
        "nonce": await web3.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x5208",
        "to": accountData.address,
        "value": "0x06f05b59d3b20000",
        "data": '0x',
        "chainId": 3
      }
      var tx = new Tx(txData);
      tx.sign(mainPrivateKey);
      var serializedTx = tx.serialize();
      console.log("in here")
      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('confirmation', async function (confirmationNumber, receipt) {
          // console.log(confirmationNumber, "times confirmationNumber");
          if (confirmationNumber == 10) {
            if (receipt.status == true) {
              byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
              projectData.tokenByteCode = byteCode.bytecode;
              projectData.tokenABICode = byteCode.interface;
              var privateKey = new Buffer(accountData.privateKey.replace("0x", ""), 'hex')
              let txData = {
                "nonce": await web3.eth.getTransactionCount(accountData.address),
                "gasPrice": "0x170cdc1e00",
                "gasLimit": "0x2dc6c0",
                "to": "",
                "value": "0x00",
                "data": '0x' + byteCode.bytecode,
                "chainId": 3
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
                    // res.status(505).end();
                  } else {
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
                        "gasPrice": "0x170cdc1e00",
                        "gasLimit": "0xD19A9",
                        "to": "",
                        "value": "0x00",
                        "data": '0x' + byteCode2.bytecode,
                        "chainId": 3
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
                            // res.status(505).end();
                          } else {
                            projectData.crowdsaleContractHash = receipt.transactionHash;
                            projectData.crowdsaleContractAddress = receipt.contractAddress;
                            await projectData.save();
                            // res.status(200).end();
                          }
                        })
                        .on('error', async function (receipt) {
                          console.log(receipt)
                          projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                          projectData.tokenContractAddress = "Deployment is in process!  Please try again";
                          await projectData.save();
                          // res.status(505).end();
                        })
                    })
                  }
                })
                .on('error', async function (receipt) {
                  console.log(receipt)
                  projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                  projectData.tokenContractAddress = "Deployment is in process!  Please try again";
                  await projectData.save();
                  // res.status(505).end();
                })
            }
            else {
              projectData.crowdsaleContractAddress = "Network error occured! Please try again";
              projectData.tokenContractAddress = "Deployment is in process!  Please try again";
              await projectData.save();
              // res.status(505).end();
            }
          }
        })
        .on('error', async function (receipt) {
          console.log(receipt)
          projectData.crowdsaleContractAddress = receipt;
          projectData.tokenContractAddress = "Deployment is in process!  Please try again";
          await projectData.save();
          // res.status(505).end();
        })
    } else {
      console.log(accountData.address)
      projectData.crowdsaleContractAddress = "Deployment is in process";
      projectData.tokenContractAddress = "Deployment is in process";
      projectData.networkType = "Mainnet";
      projectData.networkURL = "#"
      await projectData.save();
      res.redirect('/');
      byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
      projectData.tokenByteCode = byteCode.bytecode;
      projectData.tokenABICode = byteCode.interface;
      var privateKey = new Buffer(accountData.privateKey.replace("0x", ""), 'hex')
      let txData = {
        "nonce": await web3.eth.getTransactionCount(accountData.address),
        "gasPrice": "0x170cdc1e00",
        "gasLimit": "0x2dc6c0",
        "to": "",
        "value": "0x00",
        "data": '0x' + byteCode.bytecode,
        "chainId": 3
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
            // res.status(505).end();
          } else {
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
                "gasPrice": "0x170cdc1e00",
                "gasLimit": "0xD19A9",
                "to": "",
                "value": "0x00",
                "data": '0x' + byteCode2.bytecode,
                "chainId": 3
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
                    // res.status(505).end();
                  } else {
                    projectData.crowdsaleContractHash = receipt.transactionHash;
                    projectData.crowdsaleContractAddress = receipt.contractAddress;
                    await projectData.save();
                    // res.status(200).end();
                  }
                })
                .on('error', async function (receipt) {
                  console.log(receipt)
                  projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                  projectData.tokenContractAddress = "Deployment is in process!  Please try again";
                  await projectData.save();
                  // res.status(505).end();
                })
            })
          }
        })
        .on('error', async function (receipt) {
          console.log(receipt)
          projectData.crowdsaleContractAddress = "Network error occured! Please try again";
          projectData.tokenContractAddress = "Deployment is in process!  Please try again";
          await projectData.save();
          // res.status(505).end();
        })
    }
  },

  test: async function (req, res) {

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

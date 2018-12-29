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
var privateICOhandler = require('../icoHandler/privateNetworkHandler')
var etherRopstenICOhandler = require('../icoHandler/etherRopstenNetworkHandler')
var etherMainnetICOhandler = require('../icoHandler/etherMainNetworkHandler')
var nodemailerservice = require('../emailer/impl');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');
var ws_provider = config.ws_provider;
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);

module.exports = {
  projectContractData: async function (req, res) {
    ProjectConfiguration.find({
      where: {
        'coinName': req.body.tokenName
      },
    }).then(projectData => {
      if (projectData == null) {
        res.send({ status: false, message: "no data found" })
      }
      else {
        res.send({
          status: true,
          network: projectData.networkType,
          tokenContract: {
            "smartContract": projectData.tokenContractCode,
            "bytecode": projectData.tokenByteCode,
            "interface": projectData.tokenABICode,
            "address": projectData.tokenContractAddress
          },
          crowdsaleContract: {
            "smartContract": projectData.crowdsaleContractCode,
            "bytecode": projectData.crowdsaleByteCode,
            "interface": projectData.crowdsaleABICode,
            "address": projectData.crowdsaleContractAddress
          }
        })
      }
    })
  },
  getAutomaticDeployer: async function (req, res) {
    let projectData = await ProjectConfiguration.find({ where: { 'coinName': req.body.coinName, 'client_id': req.user.uniqueId } });
    if (projectData == null) {
      console.log("herewS")
      res.send({ status: false, message: "No data found!" });
    } else {
      let accountData = await userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', 'project_id': req.body.coinName } })
      projectData.crowdsaleContractAddress = "Deployment is in process";
      projectData.tokenContractAddress = "Deployment is in process";
      projectData.networkType = req.body.network;
      projectData.networkURL = "#"
      await projectData.save();
      // res.send({status:true,message:"Deployment is in process"})
      if (req.body.network == 'private') {
        try {
          privateICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
            .then(async r => {
              // console.log(r, "here 1")
              byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
              projectData.tokenByteCode = byteCode.bytecode;
              projectData.tokenABICode = byteCode.interface;
              privateICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
                .then(async tokenReceipt => {
                  // console.log(tokenReceipt, "here 2")
                  projectData.tokenContractAddress = tokenReceipt.contractAddress;
                  projectData.tokenContractHash = tokenReceipt.transactionHash;
                  var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
                  var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
                  var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
                  ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                    "SafeERC20": SafeERC20,
                    "SafeMath": SafeMath,
                    "IERC20": IERC20,
                  }, async (err, data) => {
                    nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                    byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                    byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                    projectData.crowdsaleByteCode = byteCode2.bytecode;
                    projectData.crowdsaleABICode = byteCode2.interface;
                    projectData.crowdsaleContractCode = data;
                    privateICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                      .then(async crowdsaleReceipt => {
                        // console.log(crowdsaleReceipt, "here 3")
                        projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                        projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                        await projectData.save();
                        // res.send({tokenReceipt:tokenReceipt,crowdsaleReceipt:crowdsaleReceipt})
                      })
                      .catch(async e => {
                        console.error('error in 2st deployment', e)
                        projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                        projectData.tokenContractAddress = "Network error occured! Please try again";
                        await projectData.save();
                      })
                  })
                })
                .catch(e => console.error('error in 1st deployment', e));
            })
            .catch(e => console.error('error in sendEther', e));
        } catch (e) {
          console.error('error in deployment ', e);
        }
      }
      else if (req.body.network == 'testnet') {
        try {
          etherRopstenICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
            .then(async r => {
              byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
              projectData.tokenByteCode = byteCode.bytecode;
              projectData.tokenABICode = byteCode.interface;
              etherRopstenICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
                .then(async tokenReceipt => {
                  projectData.tokenContractAddress = tokenReceipt.contractAddress;
                  projectData.tokenContractHash = tokenReceipt.transactionHash;
                  var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
                  var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
                  var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
                  ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                    "SafeERC20": SafeERC20,
                    "SafeMath": SafeMath,
                    "IERC20": IERC20,
                  }, async (err, data) => {
                    nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                    byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                    byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                    projectData.crowdsaleByteCode = byteCode2.bytecode;
                    projectData.crowdsaleABICode = byteCode2.interface;
                    projectData.crowdsaleContractCode = data;
                    etherRopstenICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                      .then(async crowdsaleReceipt => {
                        projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                        projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                        await projectData.save();
                        res.send({ tokenReceipt: tokenReceipt, crowdsaleReceipt: crowdsaleReceipt })
                      })
                      .catch(async e => {
                        console.error('error in 2st deployment', e)
                        projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                        projectData.tokenContractAddress = "Network error occured!  Please try again";
                        await projectData.save();
                      })
                  })
                })
                .catch(e => console.error('error in 1st deployment', e));
            })
            .catch(e => console.error('error in sendEther', e));
        } catch (e) {
          console.error('error in deployment ', e);
        }
      }
      else {
        try {
          byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
          projectData.tokenByteCode = byteCode.bytecode;
          projectData.tokenABICode = byteCode.interface;
          etherRopstenICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
            .then(async tokenReceipt => {
              projectData.tokenContractAddress = tokenReceipt.contractAddress;
              projectData.tokenContractHash = tokenReceipt.transactionHash;
              var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
              var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
              var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
              ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                "SafeERC20": SafeERC20,
                "SafeMath": SafeMath,
                "IERC20": IERC20,
              }, async (err, data) => {
                nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                projectData.crowdsaleByteCode = byteCode2.bytecode;
                projectData.crowdsaleABICode = byteCode2.interface;
                projectData.crowdsaleContractCode = data;
                etherRopstenICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                  .then(async crowdsaleReceipt => {
                    projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                    projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                    await projectData.save();
                  })
                  .catch(async e => {
                    console.error('error in 2st deployment', e)
                    projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                    projectData.tokenContractAddress = "Network error occured! Please try again";
                    await projectData.save();
                  })
              })
            })
            .catch(e => console.error('error in 1st deployment', e));
        } catch (e) {
          console.error('error in deployment ', e);
        }
      }
    }
  }
}


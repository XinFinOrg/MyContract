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
var apothemICOhandler = require('../icoHandler/apothemNetworkHandler')
var etherRopstenICOhandler = require('../icoHandler/etherRopstenNetworkHandler')
var etherMainnetICOhandler = require('../icoHandler/etherMainNetworkHandler')
var nodemailerservice = require('../emailer/impl');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');
var web3 = new Web3();


module.exports = {
  getBytecode: async function(req, res) {
    console.log(req.body)
    var coinName = req.query.coinName;
    var address = req.cookies['address'];
    let eth_address = await db.userCurrencyAddress.findAll({
      where: {
        "client_id": req.user.uniqueId,
        "currencyType": "masterEthereum"
      },
      raw: true,
    })
    ProjectConfiguration.find({
      where: {
        'coinSymbol': coinName
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
          byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin'] //solc.compile(projectData.tokenContractCode, 1).contracts[':Coin'].bytecode;
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
  saveDeploymentData: async function(req, res) {
    console.log(req.query)
    ProjectConfiguration.find({
      where: {
        'coinSymbol': req.query.coinName
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
        // req.session.coinName = req.query.coinName;
        req.session.coinSymbol = req.query.coinName;
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
  generatedContract: async function(req, res) {
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
          coinName: req.session.coinName,
          coinSymbol: req.session.coinSymbol
        });
      })
    })
  },

  crowdsaleDeployer: async function(req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'crowdsaleDeployer.ejs'), {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
  },

  getDeployer: async function(req, res) {
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

  getAutomaticDeployer: async function(req, res) {
    let projectData = await ProjectConfiguration.find({
      where: {
        'coinName': req.query.coinName
      }
    });
    let accountData = await userCurrencyAddress.find({
      where: {
        'client_id': req.user.uniqueId,
        'currencyType': 'Ethereum',
        'project_id': req.query.coinName
      }
    })
    projectData.crowdsaleContractAddress = "Deployment is in process";
    projectData.tokenContractAddress = "Deployment is in process";
    projectData.networkType = req.query.network;
    projectData.networkURL = "#"
    await projectData.save();
    if (req.query.network == 'mainnet') {
      try {
        privateICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
          .then(async r => {
            console.log(r, "here 1")
            byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
            projectData.tokenByteCode = byteCode.bytecode;
            projectData.tokenABICode = byteCode.interface;
            privateICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
              .then(async tokenReceipt => {
                console.log(tokenReceipt, "here 2")
                projectData.tokenContractAddress = "0x" + tokenReceipt.contractAddress.substring(3);
                projectData.tokenContractHash = tokenReceipt.transactionHash;
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
                  byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', "0x" + tokenReceipt.contractAddress.substring(3), projectData.bonusStatus]).slice(2)
                  projectData.crowdsaleByteCode = byteCode2.bytecode;
                  projectData.crowdsaleABICode = byteCode2.interface;
                  projectData.crowdsaleContractCode = data;
                  privateICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                    .then(async crowdsaleReceipt => {
                      console.log(tokenReceipt, "here 3")
                      projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                      projectData.crowdsaleContractAddress = "0x" + crowdsaleReceipt.contractAddress.substring(3);
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
          })
          .catch(e => console.error('error in sendEther', e));
      } catch (e) {
        console.error('error in deployment ', e);
      }
    }
    else if (req.query.network == 'apothem') {
      try {
        apothemICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
          .then(async r => {
            console.log(r, "here 1")
            byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
            projectData.tokenByteCode = byteCode.bytecode;
            projectData.tokenABICode = byteCode.interface;
            apothemICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
              .then(async tokenReceipt => {
                console.log(tokenReceipt, "here 2")
                projectData.tokenContractAddress = "0x" + tokenReceipt.contractAddress.substring(3);
                projectData.tokenContractHash = tokenReceipt.transactionHash;
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
                  byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', "0x" + tokenReceipt.contractAddress.substring(3), projectData.bonusStatus]).slice(2)
                  projectData.crowdsaleByteCode = byteCode2.bytecode;
                  projectData.crowdsaleABICode = byteCode2.interface;
                  projectData.crowdsaleContractCode = data;
                  apothemICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                    .then(async crowdsaleReceipt => {
                      console.log(tokenReceipt, "here 3")
                      projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                      projectData.crowdsaleContractAddress = "0x" + crowdsaleReceipt.contractAddress.substring(3);
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
          })
          .catch(e => console.error('error in sendEther', e));
      } catch (e) {
        console.error('error in deployment ', e);
      }
    }
     else if (req.query.network == 'testnet') {
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
                  "IERC20": IERC20,
                  "SafeMath": SafeMath,
                }, async (err, data) => {
                  nodemailerservice.sendContractEmail(req.user.email, data, req.query.coinName, "Crowdsale Contract");
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
    } else {
      try {
        etherMainnetICOhandler.sendEther(accountData.address, '0x2386F26FC10000')
          .then(async r => {
            byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
            projectData.tokenByteCode = byteCode.bytecode;
            projectData.tokenABICode = byteCode.interface;
            etherMainnetICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
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
                  nodemailerservice.sendContractEmail(req.user.email, data, req.query.coinName, "Crowdsale Contract");
                  byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                  byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                  projectData.crowdsaleByteCode = byteCode2.bytecode;
                  projectData.crowdsaleABICode = byteCode2.interface;
                  projectData.crowdsaleContractCode = data;
                  etherMainnetICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                    .then(async crowdsaleReceipt => {
                      projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                      projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                      await projectData.save();
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
      // try {
        
      //   console.log(accountData, "heello")
      //   byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
      //   projectData.tokenByteCode = byteCode.bytecode;
      //   projectData.tokenABICode = byteCode.interface;
      //   etherMainnetICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
      //     .then(async tokenReceipt => {
      //       projectData.tokenContractAddress = tokenReceipt.contractAddress;
      //       projectData.tokenContractHash = tokenReceipt.transactionHash;
      //       var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
      //       var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
      //       var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
      //       ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
      //         "SafeERC20": SafeERC20,
      //         "SafeMath": SafeMath,
      //         "IERC20": IERC20,
      //       }, async (err, data) => {
      //         nodemailerservice.sendContractEmail(req.user.email, data, req.query.coinName, "Crowdsale Contract");
      //         byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
      //         byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
      //         projectData.crowdsaleByteCode = byteCode2.bytecod
      //         e;
      //         projectData.crowdsaleABICode = byteCode2.interface;
      //         projectData.crowdsaleContractCode = data;
      //         console.log("PVTKEY",accountData.privateKey)
      //         etherMainnetICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
      //           .then(async crowdsaleReceipt => {
      //             projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
      //             projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
      //             await projectData.save();
      //           })
      //           .catch(async e => {
      //             console.error('error in 2st deployment', e)
      //             projectData.crowdsaleContractAddress = "Network error occured! Please try again";
      //             projectData.tokenContractAddress = "Network error occured! Please try again";
      //             await projectData.save();
      //           })
      //       })
      //     })
      //     .catch(e => console.error('all_ELSE_error in 1st deployment', e));
      // } catch (e) {
      //   console.error('error in deployment ', e);
      // }
    }
    res.redirect('/')
  },
};

function getProjectArray(email) {
  var projectArray = [];
  return new Promise(async function(resolve, reject) {
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

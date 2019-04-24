const fs = require("fs");
const path = require("path");
const nodemailerAuth = require("../config/auth").nodemailerAuth;
var coin, templateCoin, mintableContract, burnableContract, releaseableContract, upgradeableContract;
var fileReader = require('../filereader/impl');
var result;
var ejs = require("ejs");
var db = require('../database/models/index');
var ProjectConfiguration = db.projectConfiguration;
var client = db.client;
var nodemailerservice = require('../emailer/impl');
var bitcoin = require("bitcoinjs-lib");
let Promise = require('bluebird');
var Address = db.userCurrencyAddress;
const Web3 = require('web3');
const web3 = new Web3();
module.exports = {

  getCustomContractForm: async (req, res) => {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render('customContract', {
      user: req.user,
      message: req.flash('package_flash'),
      message2: req.flash('project_flash'),
      address: address,
      ProjectConfiguration: projectArray,
    });
  },
  getERC223ContractForm: async (req, res) => {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render('ERC223Contract', {
      user: req.user,
      message: req.flash('package_flash'),
      message2: req.flash('project_flash'),
      address: address,
      ProjectConfiguration: projectArray,
    });
  },

  getERC721ContractForm: async (req, res) => {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render('erc721', {
      user: req.user,
      message: req.flash('package_flash'),
      message2: req.flash('project_flash'),
      address: address,
      ProjectConfiguration: projectArray,
    });
  },
  createERC20Contract: async (req, res) => {
    var Roles = await fileReader.readEjsFile(__dirname + '/ERC20contracts/Roles.sol');
    var ERC20 = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20.sol');
    var ERC20Detailed = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Detailed.sol');
    var IERC20 = await fileReader.readEjsFile(__dirname + '/ERC20contracts/IERC20.sol');
    var Ownable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/Ownable.sol');
    var SafeERC20 = await fileReader.readEjsFile(__dirname + '/ERC20contracts/SafeERC20.sol');
    var SafeMath = await fileReader.readEjsFile(__dirname + '/ERC20contracts/SafeMath.sol');
    var SignerRole = await fileReader.readEjsFile(__dirname + '/ERC20contracts/SignerRole.sol');
    var isPausable = (req.body.isPausable == "on") ? true : false;
    var isBurnable = (req.body.isBurnable == "on") ? true : false;
    var isMintable = (req.body.isMintable == "on") ? true : false;
    var isUpgradeable = (req.body.isUpgradeable == "on") ? true : false;
    var ERC20CappedSign = "";
    inherits = "";
    var decimalInZero = "";

    for (let index = 0; index < req.body.tokenDecimals; index++) {
      decimalInZero += "0"

    }

    if (isBurnable) {
      var ERC20Burnable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Burnable.sol');
      inherits += ", ERC20Burnable";
    }
    if (isPausable) {
      var Pausable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/Pausable.sol');
      var PauserRole = await fileReader.readEjsFile(__dirname + '/ERC20contracts/PauserRole.sol');
      var ERC20Pausable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Pausable.sol');
      inherits += " , ERC20Pausable";
    }
    if (isMintable) {
      var MinterRole = await fileReader.readEjsFile(__dirname + '/ERC20contracts/MinterRole.sol');
      var ERC20Capped = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Capped.sol');
      var ERC20Mintable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Mintable.sol');
      var CapperRole = await fileReader.readEjsFile(__dirname + '/ERC20contracts/CapperRole.sol');
      var ERC20Capped = await fileReader.readEjsFile(__dirname + '/ERC20contracts/ERC20Capped.sol');

      ERC20CappedSign = "ERC20Capped(" + req.body.token_supply * 10 + "000000000000000000)"
      inherits += ", ERC20Mintable,ERC20Capped";
    }
    if (isUpgradeable) {
      var Upgradable = await fileReader.readEjsFile(__dirname + '/ERC20contracts/Upgradable.sol');
      inherits += " , Upgradeable";
    }
    ejs.renderFile(__dirname + '/ERC20contracts/Coin.sol', {
      "SafeERC20": SafeERC20,
      "SafeMath": SafeMath,
      "IERC20": IERC20,
      "ERC20": ERC20,
      "ERC20Capped": ERC20Capped,
      "ERC20Detailed": ERC20Detailed,
      "MinterRole": MinterRole,
      "Ownable": Ownable,
      "Pausable": Pausable,
      "PauserRole": PauserRole,
      "Roles": Roles,
      "CapperRole": CapperRole,
      "SignerRole": SignerRole,
      "ERC20Burnable": ERC20Burnable,
      "ERC20Pausable": ERC20Pausable,
      "Upgradable": Upgradable,
      "ERC20Mintable": ERC20Mintable,
      //data from form
      totalSupply: req.body.tokenSupply,
      name: req.body.tokenName,
      symbol: req.body.tokenSymbol,
      decimal: req.body.tokenDecimals,
      industry: req.body.industry,
      isin: req.body.isin,
      cusip:req.body.cusip,
      moodys: req.body.moodys,
      snp: req.body.snp,
      fitch: req.body.fitch,
      fsdate: req.body.fsdate,
      maturitydate: req.body.maturitydate,
      facevalue: req.body.ethRate,
      amtstanding: req.body.amtstanding,
      type: req.body.type,
      frequency: req.body.frequency,
      firstdate: req.body.firstdate,
      rate: req.body.rate,
      benchmark: req.body.benchmark,
      decimalInZero: decimalInZero,
      ERC20CappedSign: ERC20CappedSign
    }, async (err, data) => {
      if (err)
        console.log(err);
      req.session.contract = data;
      req.session.coinName = req.body.tokenName;
      // nodemailerservice.sendContractEmail(req.user.email, data);
      var clientdata = await client.find({
        where: {
          'email': req.user.email
        }
      });
      var objdata = new Object();
      objdata.contractCode = result;
      objdata.coinName = req.body.tokenName;
      objdata.tokenSupply = req.body.tokenSupply;
      objdata.coinSymbol = req.body.tokenSymbol;
      objdata.ETHRate = req.body.ethRate;
      objdata.tokenContractCode = data;
      objdata.bonusRate = req.body.bonusRate == '' ? 0 : req.body.bonusRate;
      objdata.bonusStatus = req.body.bonusRate == null ? true : false;
      Promise.all([generateEthAddress(), generateBTCAddress()]).then(async ([createdEthAddress, createdBTCAddress]) => {
        var projectData = await ProjectConfiguration.create(objdata)
        await clientdata.addProjectConfiguration(projectData);
        await clientdata.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        await projectData.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        clientdata.package1 -= 1;
        clientdata.save();
      })
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead("200");
      res.write(objdata.tokenContractCode);
    });
  },
  createERC223Contract: async (req, res) => {
    var Roles = await fileReader.readEjsFile(__dirname + '/ERC223contracts/Roles.sol');
    var ERC20 = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20.sol');
    var ERC20Detailed = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Detailed.sol');
    var IERC20 = await fileReader.readEjsFile(__dirname + '/ERC223contracts/IERC20.sol');
    var ERC223_receiving_contract = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC223_receiving_contract.sol');
    var Ownable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/Ownable.sol');
    var SafeERC20 = await fileReader.readEjsFile(__dirname + '/ERC223contracts/SafeERC20.sol');
    var SafeMath = await fileReader.readEjsFile(__dirname + '/ERC223contracts/SafeMath.sol');
    var SignerRole = await fileReader.readEjsFile(__dirname + '/ERC223contracts/SignerRole.sol');
    var isPausable = (req.body.isPausable == "on") ? true : false;
    var isBurnable = (req.body.isBurnable == "on") ? true : false;
    var isMintable = (req.body.isMintable == "on") ? true : false;
    var isUpgradeable = (req.body.isUpgradeable == "on") ? true : false;
    var ERC20CappedSign = "";
    inherits = "";
    var decimalInZero = "";

    for (let index = 0; index < req.body.tokenDecimals; index++) {
      decimalInZero += "0"
    }
    if (isBurnable) {
      var ERC20Burnable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Burnable.sol');
      inherits += ", ERC20Burnable";
    }
    if (isPausable) {
      var Pausable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/Pausable.sol');
      var PauserRole = await fileReader.readEjsFile(__dirname + '/ERC223contracts/PauserRole.sol');
      var ERC20Pausable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Pausable.sol');
      inherits += " , ERC20Pausable";
    }
    if (isMintable) {
      var MinterRole = await fileReader.readEjsFile(__dirname + '/ERC223contracts/MinterRole.sol');
      var ERC20Capped = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Capped.sol');
      var ERC20Mintable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Mintable.sol');
      var CapperRole = await fileReader.readEjsFile(__dirname + '/ERC223contracts/CapperRole.sol');
      var ERC20Capped = await fileReader.readEjsFile(__dirname + '/ERC223contracts/ERC20Capped.sol');

      ERC20CappedSign = "ERC20Capped(" + req.body.token_supply * 10 + "000000000000000000)"
      inherits += ", ERC20Mintable,ERC20Capped";
    }
    if (isUpgradeable) {
      var Upgradable = await fileReader.readEjsFile(__dirname + '/ERC223contracts/Upgradable.sol');
      inherits += " , Upgradeable";
    }
    ejs.renderFile(__dirname + '/ERC223contracts/Coin.sol', {
      "SafeERC20": SafeERC20,
      "SafeMath": SafeMath,
      "IERC20": IERC20,
      "ERC20": ERC20,
      "ERC20Capped": ERC20Capped,
      "ERC20Detailed": ERC20Detailed,
      "MinterRole": MinterRole,
      "Ownable": Ownable,
      "Pausable": Pausable,
      "PauserRole": PauserRole,
      "Roles": Roles,
      "CapperRole": CapperRole,
      "SignerRole": SignerRole,
      "ERC20Burnable": ERC20Burnable,
      "ERC20Pausable": ERC20Pausable,
      "Upgradable": Upgradable,
      "ERC20Mintable": ERC20Mintable,
      "ERC223_receiving_contract": ERC223_receiving_contract,
      //data from form
      totalSupply: req.body.tokenSupply,
      name: req.body.tokenName,
      symbol: req.body.tokenSymbol,
      decimal: req.body.tokenDecimals,
      decimalInZero: decimalInZero,
      ERC20CappedSign: ERC20CappedSign
    }, async (err, data) => {
      if (err)
        console.log(err);
      req.session.contract = data;
      req.session.coinName = req.body.tokenName;
      nodemailerservice.sendContractEmail(req.user.email, data);
      var clientdata = await client.find({
        where: {
          'email': req.user.email
        }
      });
      var objdata = new Object();
      objdata.contractCode = result;
      objdata.coinName = req.body.tokenName;
      objdata.tokenSupply = req.body.tokenSupply;
      objdata.coinSymbol = req.body.tokenSymbol;
      objdata.ETHRate = req.body.ethRate;
      objdata.tokenContractCode = data;
      objdata.bonusRate = req.body.bonusRate == '' ? 0 : req.body.bonusRate;
      objdata.bonusStatus = req.body.bonusRate == null ? true : false;
      Promise.all([generateEthAddress(), generateBTCAddress()]).then(async ([createdEthAddress, createdBTCAddress]) => {
        var projectData = await ProjectConfiguration.create(objdata)
        await clientdata.addProjectConfiguration(projectData);
        await clientdata.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        await projectData.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        clientdata.package1 -= 1;
        clientdata.save();
      })
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead("200");
      res.write(objdata.tokenContractCode);
      res.end();
    });
  },
  createERC721Contract: async (req, res) => {
    console.log("inside erc721 contract",req.body);
    var SafeMath = await fileReader.readEjsFile(__dirname + '/ERC721contracts/SafeMath.sol');
    var Roles = await fileReader.readEjsFile(__dirname + '/ERC721contracts/Roles.sol');
    var ERC721Holder = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Holder.sol');
    var Address = await fileReader.readEjsFile(__dirname + '/ERC721contracts/Address.sol');
    var ERC165 = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC165.sol');
    var ERC721Mintable = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Mintable.sol');
    var ERC721Enumerable = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Enumerable.sol');
    var ERC721Metadata = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Metadata.sol');
    var isPausable = (req.body.isPausable == "on") ? true : false;
    var isBurnable = (req.body.isBurnable == "on") ? true : false;
    var isOwnable = (req.body.isOwnable == "on") ? true : false;
    var ERC721Burnable, ERC721Pausable, Ownable, inherits = "";

    if (isBurnable) {
      ERC721Burnable = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Burnable.sol');
      inherits += ", Burnable";
    }

    if (isPausable) {
      ERC721Pausable = await fileReader.readEjsFile(__dirname + '/ERC721contracts/ERC721Pausable.sol');
      inherits += ", Pausable";
    }
    if (isOwnable) {
      Ownable = await fileReader.readEjsFile(__dirname + '/ERC721contracts/Ownable.sol');
      inherits += ", Ownable";
    }
    ejs.renderFile(__dirname + '/ERC721contracts/Coin.sol', {
      'SafeMath': SafeMath,
      'Roles': Roles,
      'ERC721Holder': ERC721Holder,
      'Address': Address,
      'ERC165': ERC165,
      'ERC721Enumerable': ERC721Enumerable,
      'ERC721Metadata': ERC721Metadata,
      'ERC721Burnable': ERC721Burnable,
      'ERC721Mintable': ERC721Mintable,
      'ERC721Pausable': ERC721Pausable,
      'Ownable': Ownable,
      'tokenName': req.body.tokenName,
      'tokenSymbol': req.body.tokenSymbol,
      'inherits': inherits
    }, async (err, data) => {
      if (err)
        console.log(err);
      // console.log("inside erc721 contract 1",req.body);  
      var objdata = new Object();
      objdata.contractCode = result;
      objdata.type = req.body.type;
      objdata.tokenContractCode = data;
      objdata.coinName = req.body.tokenName;
      objdata.coinSymbol = req.body.tokenSymbol;
      objdata.ipfsHash = req.body.hash;
      // console.log("inside erc721 contract 2",objdata);
      var clientdata = await client.find({
        where: {
          'email': req.user.email
        }
      });
      
  
      Promise.all([generateEthAddress(), generateBTCAddress()]).then(async ([createdEthAddress, createdBTCAddress]) => {
        var projectData = await ProjectConfiguration.create(objdata)
        await clientdata.addProjectConfiguration(projectData);
        await clientdata.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        await projectData.addUserCurrencyAddresses([createdEthAddress, createdBTCAddress]);
        clientdata.package1 -= 1;
        clientdata.save();
      })
      // nodemailerservice.sendContractEmail(req.user.email, data);
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead("200");
      res.write(data);
      res.end();
    });
  },
}

function generateEthAddress() {
  return new Promise(async function (resolve, reject) {
    var newEthAddress = new Object();
    var keyStore = generateNewAccount();
    newEthAddress.privateKey = keyStore.privateKey;
    newEthAddress.address = keyStore.address;
    newEthAddress.currencyType = "Ethereum";
    var createdEthAddress = await Address.create(newEthAddress);
    resolve(createdEthAddress);
  });
}

function generateNewAccount(password) {
  return web3.eth.accounts.create(web3.utils.randomHex(32));
};
function generateBTCAddress() {
  return new Promise(async function (resolve, reject) {
    var newBTCAddress = new Object();
    const TestNet = bitcoin.networks.testnet;
    var keyPair = bitcoin.ECPair.makeRandom();
    let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
    newBTCAddress.address = address;
    newBTCAddress.privateKey = keyPair.toWIF();
    newBTCAddress.currencyType = "Bitcoin";
    var createdBTCAddress = await Address.create(newBTCAddress);
    resolve(createdBTCAddress);
  });
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
        attributes: ['coinName', 'tokenContractAddress', 'tokenContractHash', 'crowdsaleContractCode']
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

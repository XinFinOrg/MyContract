const fs = require("fs");
const path = require("path");
const nodemailerAuth = require("../config/auth").nodemailerAuth;
var coin, templateCoin, mintableContract, burnableContract, releaseableContract, upgradeableContract;
var filereaderservice = require('../filereader/impl');
var result;
var db = require('../database/models/index');
var ProjectConfiguration = db.projectConfiguration;
var client = db.client;

templateCoin = filereaderservice.readContract(path.resolve(__dirname, "./contracts/", "template.sol"));

fs.readFile(path.resolve(__dirname, "./contracts/", "releaseTemplate.sol"), "utf8",
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    releaseableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "upgrade.sol"), "utf8",
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    upgradeableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "mintable.sol"), "utf8",
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    mintableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "burnable.sol"), "utf8",
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    burnableContract = data;
  });

var nodemailerservice = require('../emailer/impl');
module.exports = {

  getCustomContractForm: function (req, res) {
    res.render('customContract');
  },

  createContract: async function (req, res) {
    // custom token
    var mint = "";
    var allContracts = "";
    var release = "";
    var upgrade = "";
    var burn = "";
    var upgradeCon = "";

    var isReleasable = (req.body.isR == "on") ? true : false;
    var isUpgradable = (req.body.isU == "on") ? true : false;
    var isBurnable = (req.body.isB == "on") ? true : false;
    var isMintable = (req.body.isM == "on") ? true : false;;

    generateCustomContract(req.body, isBurnable, isMintable, isReleasable, isUpgradable, res);
    nodemailerservice.sendContractEmail(req.user.email, result);
    req.session.contract = result;
    req.session.coinName = req.body.token_name;
    var clientdata = await client.find({
      where: {
        'email': req.user.email
      }
    });
    var objdata = new Object();
    objdata.contractCode = result;
    objdata.coinName = req.body.token_name;
    objdata.tokenSupply = req.body.token_supply;
    objdata.hardCap = req.body.token_sale;
    var projectData = await ProjectConfiguration.create(objdata)
    clientdata.addProjectConfiguration(projectData);
    //packageremoval will be added here
    res.redirect('/generatedContract');
  },

  getGeneratedContract: function (req, res) {
    res.render('deployedContract', {
      user: req.user,
      contract: req.session.contract,
      coinName: req.session.coinName
    });
  }
}

async function generateCustomContract(
  body,
  burnable,
  mintable,
  releaseable,
  upgradeable,
  res
) {
  var mint = "";
  var allContracts = "";
  var release = "";
  var upgrade = "";
  var burn = "";
  var upgradeCon = "";
  template = templateCoin;
  if (releaseable && upgradeable) {
    release = releaseableContract;
    upgrade = upgradeableContract;
    upgradeCon = "UpgradeableToken(msg.sender)";
    if (mintable) {
      mint = mintableContract;
      if (burnable) {
        // all funcs
        burn = burnableContract;
        allContracts = "Burnable,Mintable";
      } else {
        // r,u,m
        allContracts = "Mintable";
      }
    } else if (burnable) {
      // r,u,b
      burn = burnableContract;
      allContracts = "Burnable";
    } else {
      // r & u
      mint = mintableContract;
      allContracts = "ReleasableToken,UpgradeableToken";
    }
  } else if (releaseable) {
    if (mintable) {
      mintableContract = mintableContract.replace(
        /UpgradeableToken/g,
        "StandardToken"
      );
      if (burnable) {
        // r,m,b
        burnableContract = burnableContract.replace(
          /UpgradeableToken/g,
          "StandardToken"
        );
        mint = mintableContract;
        release = releaseableContract;
        burn = burnableContract;
        allContracts = "Burnable,Mintable";
      } else {
        // r,m
        mint = mintableContract;
        release = releaseableContract;
        allContracts = "Mintable";
      }
    } else if (burnable) {
      // r,b
      burnableContract = burnableContract.replace(
        /UpgradeableToken/g,
        "StandardToken"
      );
      release = releaseableContract;
      burn = burnableContract;
      allContracts = "Burnable";
    } else {
      // r
      release = releaseable;
      allContracts = "ReleasableToken,StandardToken";
    }
  } else if (upgradeable) {
    upgrade = upgradeableContract;
    upgradeCon = "UpgradeableToken(msg.sender)";
    if (mintable) {
      mintableContract = mintableContract.replace(
        /ReleasableToken,UpgradeableToken/g,
        "ERC20,Ownable,UpgradeableToken"
      );
      mint = mintableContract;
      if (burnable) {
        // u,m,b
        burnableContract = burnableContract.replace(
          /ReleasableToken,UpgradeableToken/g,
          "ERC20,Ownable,UpgradeableToken"
        );
        burn = burnableContract;
        allContracts = "Burnable,Mintable";
      } else {
        // u,m
        allContracts = "Mintable";
      }
    } else if (burnable) {
      // u,b
      burnableContract = burnableContract.replace(
        /ReleasableToken,UpgradeableToken/g,
        "ERC20,Ownable,UpgradeableToken"
      );
      burn = burnableContract;
      allContracts = "Burnable";
    } else {
      // u
      allContracts = "ERC20,Ownable,UpgradeableToken";
    }
  } else if (mintable) {
    mintableContract = mintableContract.replace(
      /ReleasableToken,UpgradeableToken/g,
      "ERC20,Ownable,StandardToken"
    );
    mint = mintableContract;
    if (burnable) {
      // b, m
      burnableContract = burnableContract.replace(
        /ReleasableToken,UpgradeableToken/g,
        "ERC20,Ownable,StandardToken"
      );
      burn = burnableContract;
      allContracts = "Mintable,Burnable";
    } else {
      // m
      allContracts = "Mintable";
    }
  } else if (burnable) {
    // b
    burnableContract = burnableContract.replace(
      /ReleasableToken,UpgradeableToken/g,
      "ERC20,Ownable,StandardToken"
    );
    burn = burnableContract;
    allContracts = "Burnable";
  } else {
    // no func seleted
    allContracts = "ERC20,Ownable,StandardToken";
  }

  var mapObj = {
    upgradeableToken: upgrade,
    releaseableToken: release,
    mintableToken: mint,
    burnableToken: burn,
    allContracts: allContracts,
    tokenName: body.token_name,
    tokenSymbol: body.token_symbol,
    tokenDecimals: body.token_decimals.toString(),
    tokenTotalSupply: body.token_supply.toString(),
    tokenOnSale: body.token_sale.toString(),
    tokenPricePerToken: body.eth_tokens.toString(),
    upgradeCon: upgradeCon
  };
  result = template.replace(
    /upgradeableToken|releaseableToken|mintableToken|burnableToken|allContracts|tokenName|tokenSymbol|tokenDecimals|tokenTotalSupply|tokenOnSale|tokenPricePerToken|upgradeCon/gi,
    function (matched) {
      return mapObj[matched];
    }
  );
}

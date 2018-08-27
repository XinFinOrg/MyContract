const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const nodemailerAuth = require("../config/auth").nodemailerAuth;
const solc = require("solc");
var User = require('../userlogin/models');
var coin, templateCoin, mintableContract, burnableContract, releaseableContract, upgradeableContract;
var filereaderservice = require('../filereader/impl');
var result, bytecode;
var Client = require('../database/models/index').Client;


templateCoin = filereaderservice.readContract(path.resolve(__dirname, "./contracts/", "template.sol"));

// function onReadTemplateCoinContract(err, data) {
//   if (err) {
//     console.log(err);
//   } else {
//     templateCoin = data;
//   }
// }

fs.readFile(path.resolve(__dirname, "./contracts/", "releaseTemplate.sol"), "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    releaseableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "upgrade.sol"), "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    upgradeableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "mintable.sol"), "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    mintableContract = data;
  });
fs.readFile(path.resolve(__dirname, "./contracts/", "burnable.sol"), "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    burnableContract = data;
  });
fs.readFile(path.resolve(__dirname + "/contracts/" + "coin.sol"), "utf8", function(err, data) {
  if (err) {
    return console.log(err);
  }
  coin = data;
});

var nodemailerservice = require('../emailer/impl');
module.exports = {

  getCustomContractForm: function(req, res) {
    res.render('customContract');
  },

  createContract: async function(req, res) {
    console.log("Template data is ", templateCoin);
    if (!fs.existsSync(__dirname + "/contractDirectory")){
      fs.mkdirSync(__dirname + "/contractDirectory");
    }
    var userDir = path.resolve(__dirname + "/contractDirectory/" + req.user.email);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
  }


    var mapObj = {
      tokenName: req.body.token_name,
      tokenSymbol: req.body.token_symbol,
      tokenDecimals: req.body.token_decimals.toString(),
      tokenTotalSupply: req.body.token_supply.toString(),
      tokenOnSale: req.body.token_sale.toString(),
      tokenPricePerToken: req.body.eth_tokens.toString()
    };
    result = coin.replace(
      /tokenName|tokenSymbol|tokenDecimals|tokenTotalSupply|tokenOnSale|tokenPricePerToken/gi,
      function(matched) {
        return mapObj[matched];
      }
    );
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

    fs.writeFile(path.resolve(userDir + "/" + req.body.token_name + ".sol"), result, {
      flag: 'w'
    }, function(err) {
      if (err)
        return console.log(err);
    });

    nodemailerservice.sendContractEmail(req.user.email, result);
    // byteCode = solc.compile(result.toString(), 1).contracts[':Coin'];
    // //file read for contract bytecode
    // fs.writeFile(path.resolve(userDir + "/" + req.body.token_name + ".bytecode"), byteCode.bytecode, {
    //   flag: 'w'
    // }, function(err) {
    //   if (err) return console.log(err);
    // });
    // req.session.byteCode = byteCode.bytecode;
    req.session.contract = result;
    req.session.token_name= req.body.token_name;
    Client.update({"package1":false},{
      where: {'email':req.user.email}
    }).then(function(result) {
      if (!result)
      res.send("Something wrong when updating packages!");

      console.log("packages updated");
      res.redirect('/generatedContract');
  })
  },

  getGeneratedContract: function(req, res) {
    // console.log(req.session.contract);
    res.render('deployedContract', {
      user: req.user,
      contract: req.session.contract,
      byteCode: req.session.byteCode
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
    function(matched) {
      return mapObj[matched];
    }
  );
}

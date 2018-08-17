const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const nodemailerAuth = require("../config/auth").nodemailerAuth;
var templateCoin;
var mintableContract;
var burnableContract;
var releaseableContract;
var upgradeableContract;
var nodemailer = require('nodemailer');
var filereaderservice = require('../filereader/impl');
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: nodemailerAuth
});

fs.readFile(path.resolve(__dirname, "./contracts/", "template.sol"), "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    templateCoin = data;
  });
console.log("Template data is " + templateCoin);

fs.readFile(
  path.resolve(__dirname, "./contracts/", "releaseTemplate.sol"), "utf8",
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

var nodemailerservice = require('../emailer/impl');
module.exports = {

  createContract: async function(req, res) {
    var userDir = path.resolve(__dirname + "/contractdirectory/" + req.user.email);
    var fs = require("fs");

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    if (req.body.tokenType == "R") {
      fs.readFile(path.resolve(__dirname + "/contracts/" + "coin.sol"), "utf8", async function(err, data) {
        if (err) {}

        const pricePerToken = Math.floor(10 ** 18 / parseInt(req.body.eth_tokens));

        var mapObj = {
          tokenName: req.body.token_name,
          tokenSymbol: req.body.token_symbol,
          tokenDecimals: req.body.token_decimals.toString(),
          tokenTotalSupply: req.body.token_supply.toString(),
          tokenOnSale: req.body.token_sale.toString(),
          tokenPricePerToken: req.body.eth_tokens.toString(),
        };
        var result = data.replace(
          /tokenName|tokenSymbol|tokenDecimals|tokenTotalSupply|tokenOnSale|tokenPricePerToken/gi,
          function(matched) {
            return mapObj[matched];
          }
        );

        fs.writeFile(path.resolve(__dirname, "..", "allContracts", req.user.email + ".sol"), result, "utf8", function(err) {
          if (err) return console.log(err);
        });

        nodemailerservice.sendContractEmail(req.user.email, result);
        req.session.contract = result;
        res.redirect('/deployedContract');
        byteCode=solc.compile({
          sources: {
              'Contract' : result
          }
      }, 1);
        req.session.byteCode=byteCode.contracts['Contract:Coin'].runtimeBytecode;
        req.session.contract= result;
        res.redirect('/deployedContract');
        
        await User.update({
          google_id: req.user.googleId
        }, {
          $set: {
            count: count,
            countLeft: countLeft
          }
        });
      });
    } else {
      // custom token
      var mint = "";
      var allContracts = "";
      var release = "";
      var upgrade = "";
      var burn = "";
      var upgradeCon = "";
      const pricePerToken = Math.floor(
        10 ** 18 / parseInt(req.body.eth_tokens)
      );

      var isReleasable = (req.body.isR == "on") ? true : false;
      var isUpgradable = (req.body.isU == "on") ? true : false;
      var isBurnable = (req.body.isB == "on") ? true : false;
      var isMintable = (req.body.isM == "on") ? true : false;;

      generateCustomContract(
        req.user,
        req.body,
        isBurnable,
        isMintable,
        isReleasable,
        isUpgradable,
        pricePerToken,
        res
      );
    }

    async function generateCustomContract(
      user,
      body,
      burnable,
      mintable,
      releaseable,
      upgradeable,
      pricePerToken,
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
        if (mintable) {
          if (burnable) {
            // all funcs
            mint = mintableContract;
            release = releaseableContract;
            burn = burnableContract;
            upgrade = upgradeableContract;
            allContracts = "Burnable,Mintable";
            upgradeCon = body.token_symbol + "UpgradeableToken(msg.sender)";
          } else {
            // r,u,m
            mint = mintableContract;
            release = releaseableContract;
            upgrade = upgradeableContract;
            allContracts = "Mintable";
            upgradeCon = body.token_symbol + "UpgradeableToken(msg.sender)";
          }
        } else if (burnable) {
          // r,u,b
          release = releaseableContract;
          burn = burnableContract;
          upgrade = upgradeableContract;
          allContracts = "Burnable";
          upgradeCon = body.token_symbol + "UpgradeableToken(msg.sender)";
        } else {
          // r & u
          mint = mintableContract;
          release = releaseableContract;
          allContracts = "ReleasableToken,UpgradeableToken";
          upgradeCon = body.token_symbol + "UpgradeableToken(msg.sender)";
        }
      } else if (releaseable) {
        if (mintable) {
          if (burnable) {
            // r,m,u

            mintableContract = mintableContract.replace(
              /UpgradeableToken/g,
              "StandardToken"
            );
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
            mintableContract = mintableContract.replace(
              /UpgradeableToken/g,
              "StandardToken"
            );
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
        if (mintable) {
          if (burnable) {
            // u,m,u
            mintableContract = mintableContract.replace(
              /ReleasableToken,UpgradeableToken/g,
              "ERC20,Ownable,UpgradeableToken"
            );
            burnableContract = burnableContract.replace(
              /ReleasableToken,UpgradeableToken/g,
              "ERC20,Ownable,UpgradeableToken"
            );
            mint = mintableContract;
            upgrade = upgradeableContract;
            burn = burnableContract;
            upgradeCon = "UpgradeableToken(msg.sender)";
            allContracts = "Burnable,Mintable";
          } else {
            // u,m
            mintableContract = mintableContract.replace(
              /ReleasableToken,UpgradeableToken/g,
              "ERC20,Ownable,UpgradeableToken"
            );
            mint = mintableContract;
            upgrade = upgradeableContract;
            upgradeCon = "UpgradeableToken(msg.sender)";
            allContracts = "Mintable";
          }
        } else if (burnable) {
          // u,b
          burnableContract = burnableContract.replace(
            /ReleasableToken,UpgradeableToken/g,
            "ERC20,Ownable,UpgradeableToken"
          );
          upgrade = upgradeableContract;
          burn = burnableContract;
          upgradeCon = "UpgradeableToken(msg.sender)";
          allContracts = "Burnable";
        } else {
          // u
          upgrade = upgradeableContract;
          upgradeCon = "UpgradeableToken(msg.sender)";
          allContracts = "ERC20,Ownable,UpgradeableToken";
        }
      } else if (mintable) {
        if (burnable) {
          // b, m

          mintableContract = mintableContract.replace(
            /ReleasableToken,UpgradeableToken/g,
            "ERC20,Ownable,StandardToken"
          );
          burnableContract = burnableContract.replace(
            /ReleasableToken,UpgradeableToken/g,
            "ERC20,Ownable,StandardToken"
          );
          mint = mintableContract;
          burn = burnableContract;
          allContracts = "Mintable,Burnable";
        } else {
          // m
          mintableContract = mintableContract.replace(
            /ReleasableToken,UpgradeableToken/g,
            "ERC20,Ownable,StandardToken"
          );
          mint = mintableContract;
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
      var result = template.replace(
        /upgradeableToken|releaseableToken|mintableToken|burnableToken|allContracts|tokenName|tokenSymbol|tokenDecimals|tokenTotalSupply|tokenOnSale|tokenPricePerToken|upgradeCon/gi,
        function(matched) {
          return mapObj[matched];
        }
      );
      fs.writeFile(path.resolve(__dirname, "..", "allContracts", req.user.email + ".sol"), result, "utf8", function(err) {
        if (err) return console.log(err);
      });

      nodemailerservice.sendContractEmail(user.email, result);

      res.json({
        contract: result
      });
    }
  }
  );
  req.session.contract= result;
  res.redirect('/deployedContract');
}



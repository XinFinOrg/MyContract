const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
var templateCoin;
var mintableContract;
var burnableContract;
var releaseableContract;
var upgradeableContract;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "smartplatformsc@gmail.com",
        pass: "QwertY))&"
    }
});
module.exports = {

  createContract: async function(req, res) {
    console.log(req.body);
    var userDir = path.resolve(__dirname+ "/contractdirectory"+ req.user.email);
    var fs = require("fs");
    console.log(userDir);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir);
    }

    const currentUser = req.user;
    console.log(currentUser);

    if (req.body.tokenType == "recomm") {
      fs.readFile(path.resolve(__dirname,"..", "coin.sol"), "utf8", async function(err, data) {
        if (err) {
        }

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
        var count = currentUser.count + 1;
        var name = count + ".sol";
        var countLeft = currentUser.countLeft - 1;
        console.log(name);
        fs.writeFile(
          path.resolve(
            __dirname,
            "..",
            "allContracts",
            req.user.emailID,
            name
          ),
          result,
          "utf8",
          function(err) {
            if (err) return console.log(err);
          }
        );

        var mailOptions = {
          from: "smartplatformsc@gmail.com",
          to: req.user.emailID,
          subject: "ERC20 based SM",
          text: "this is an ERC20 complient smart contract automatically developed by the smart platform \n This smart contract is developed along the features that are considered important by XinFin",
          attachments: [{
            filename: "coin.sol",
            content: result
          }]
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
            return;
          }
        });

        res.json({
          contract: result
        });
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

      console.log(req.body.isR);
      if (req.body.isR != "" || req.body.isU != "") {
        if (req.body.isR != "" && req.body.isU != "") {
          if (req.body.isB != "") {
            if (req.body.isM != "") {
              generateCustomContract(
                req.user,
                req.body,
                true,
                true,
                true,
                true,
                pricePerToken,
                res
              );
            } else {
              // not mintable

              generateCustomContract(
                req.user,
                req.body,
                true,
                false,
                true,
                true,
                pricePerToken,
                res
              );

              //
            }
          } else {
            // not burnable

            if (req.body.isM != "") {
              //mintable

              generateCustomContract(
                req.user,
                req.body,
                false,
                true,
                true,
                true,
                pricePerToken,
                res
              );
            } else {
              //not mintable

              generateCustomContract(
                req.user,
                req.body,
                false,
                false,
                true,
                true,
                pricePerToken,
                res
              );
            }
          }
        } else if (req.body.isU != "") {
          if (req.body.isB != "") {
            if (req.body.isM != "") {
              generateCustomContract(
                req.user,
                req.body,
                true,
                true,
                false,
                true,
                pricePerToken,
                res
              );
            } else {
              // not mintable

              generateCustomContract(
                req.user,
                req.body,
                true,
                false,
                false,
                true,
                pricePerToken,
                res
              );
            }
          } else {
            // not burnable

            if (req.body.isM != "") {
              //mintable

              generateCustomContract(
                req.user,
                req.body,
                false,
                true,
                false,
                true,
                pricePerToken,
                res
              );
            } else {
              //not mintable
              generateCustomContract(
                req.user,
                req.body,
                false,
                false,
                false,
                true,
                pricePerToken,
                res
              );
            }
          }
        } else if (req.body.isR != "") {
          if (req.body.isB != "") {
            if (req.body.isM != "") {
              generateCustomContract(
                req.user,
                req.body,
                true,
                true,
                true,
                false,
                pricePerToken,
                res
              );
            } else {
              generateCustomContract(
                req.user,
                req.body,
                true,
                false,
                true,
                false,
                pricePerToken,
                res
              );
            }
          } else {
            // not burnable

            if (req.body.isM != "") {
              //mintable

              generateCustomContract(
                req.user,
                req.body,
                false,
                true,
                true,
                false,
                pricePerToken,
                res
              );
            } else {
              //not mintable
              generateCustomContract(
                req.user,
                req.body,
                false,
                false,
                true,
                false,
                pricePerToken,
                res
              );
            }
          }
        }
      } else if (req.body.isM != "") {
        if (req.body.isB != "") {
          generateCustomContract(
            req.user,
            req.body,
            true,
            true,
            false,
            false,
            pricePerToken,
            res
          );
        } else {
          generateCustomContract(
            req.user,
            req.body,
            false,
            true,
            false,
            false,
            pricePerToken,
            res
          );
        }
      } else if (req.body.isB != "") {
        console.log("inside isB");

        generateCustomContract(
          req.user,
          req.body,
          true,
          false,
          false,
          false,
          pricePerToken,
          res
        );
      } else {
        // no function selected
        generateCustomContract(
          req.user,
          req.body,
          false,
          false,
          false,
          false,
          pricePerToken,
          res
        );
      }
    }

  }
}

fs.readFile(path.resolve(__dirname, "./contracts/", "template.sol"), "utf8", function(
  err,
  data
) {
  if (err) {
    return console.log(err);
  }
  templateCoin = data;
});

fs.readFile(
  path.resolve(__dirname, "./contracts/", "releaseTemplate.sol"),
  "utf8",
  function(err, data) {
    if (err) {
      return console.log(err);
    }
    releaseableContract = data;
  }
);
fs.readFile(path.resolve(__dirname, "./contracts/", "upgrade.sol"), "utf8", function(
  err,
  data
) {
  if (err) {
    return console.log(err);
  }
  upgradeableContract = data;
});
fs.readFile(path.resolve(__dirname, "./contracts/", "mintable.sol"), "utf8", function(
  err,
  data
) {
  if (err) {
    return console.log(err);
  }
  mintableContract = data;
});
fs.readFile(path.resolve(__dirname, "./contracts/", "burnable.sol"), "utf8", function(
  err,
  data
) {
  if (err) {
    return console.log(err);
  }
  burnableContract = data;
});



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
        upgradeCon = "CMBUpgradeableToken(msg.sender)";
      } else {
        // r,u,m
        mint = mintableContract;
        release = releaseableContract;
        upgrade = upgradeableContract;
        allContracts = "Mintable";
        upgradeCon = "CMBUpgradeableToken(msg.sender)";
      }
    } else if (burnable) {
      // r,u,b
      release = releaseableContract;
      burn = burnableContract;
      upgrade = upgradeableContract;
      allContracts = "Burnable";
      upgradeCon = "CMBUpgradeableToken(msg.sender)";
    } else {
      // r & u
      mint = mintableContract;
      release = releaseableContract;
      allContracts = "ReleasableToken,CMBUpgradeableToken";
      upgradeCon = "CMBUpgradeableToken(msg.sender)";
    }
  } else if (releaseable) {
    if (mintable) {
      if (burnable) {
        // r,m,u

        mintableContract = mintableContract.replace(
          /CMBUpgradeableToken/g,
          "StandardToken"
        );
        burnableContract = burnableContract.replace(
          /CMBUpgradeableToken/g,
          "StandardToken"
        );
        mint = mintableContract;
        release = releaseableContract;
        burn = burnableContract;
        allContracts = "Burnable,Mintable";
      } else {
        // r,m
        mintableContract = mintableContract.replace(
          /CMBUpgradeableToken/g,
          "StandardToken"
        );
        mint = mintableContract;
        release = releaseableContract;
        allContracts = "Mintable";
      }
    } else if (burnable) {
      // r,b
      burnableContract = burnableContract.replace(
        /CMBUpgradeableToken/g,
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
          /ReleasableToken,CMBUpgradeableToken/g,
          "ERC20,Ownable,CMBUpgradeableToken"
        );
        burnableContract = burnableContract.replace(
          /ReleasableToken,CMBUpgradeableToken/g,
          "ERC20,Ownable,CMBUpgradeableToken"
        );
        mint = mintableContract;
        upgrade = upgradeableContract;
        burn = burnableContract;
        upgradeCon = "CMBUpgradeableToken(msg.sender)";
        allContracts = "Burnable,Mintable";
      } else {
        // u,m
        mintableContract = mintableContract.replace(
          /ReleasableToken,CMBUpgradeableToken/g,
          "ERC20,Ownable,CMBUpgradeableToken"
        );
        mint = mintableContract;
        upgrade = upgradeableContract;
        upgradeCon = "CMBUpgradeableToken(msg.sender)";
        allContracts = "Mintable";
      }
    } else if (burnable) {
      // u,b
      burnableContract = burnableContract.replace(
        /ReleasableToken,CMBUpgradeableToken/g,
        "ERC20,Ownable,CMBUpgradeableToken"
      );
      upgrade = upgradeableContract;
      burn = burnableContract;
      upgradeCon = "CMBUpgradeableToken(msg.sender)";
      allContracts = "Burnable";
    } else {
      // u
      upgrade = upgradeableContract;
      upgradeCon = "CMBUpgradeableToken(msg.sender)";
      allContracts = "ERC20,Ownable,CMBUpgradeableToken";
    }
  } else if (mintable) {
    if (burnable) {
      // b, m

      mintableContract = mintableContract.replace(
        /ReleasableToken,CMBUpgradeableToken/g,
        "ERC20,Ownable,StandardToken"
      );
      burnableContract = burnableContract.replace(
        /ReleasableToken,CMBUpgradeableToken/g,
        "ERC20,Ownable,StandardToken"
      );
      mint = mintableContract;
      burn = burnableContract;
      allContracts = "Mintable,Burnable";
    } else {
      // m
      mintableContract = mintableContract.replace(
        /ReleasableToken,CMBUpgradeableToken/g,
        "ERC20,Ownable,StandardToken"
      );
      mint = mintableContract;
      allContracts = "Mintable";
    }
  } else if (burnable) {
    // b

    burnableContract = burnableContract.replace(
      /ReleasableToken,CMBUpgradeableToken/g,
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
  var count = user.count + 1;
  var name = count + ".sol";
  var countLeft = user.countLeft - 1;
  console.log(name);
  fs.writeFile(
    path.resolve(__dirname+ "/contractdirectory"+ user.email+ name),
    result,
    "utf8",
    function(err) {
      if (err) return console.log(err);
    }
  );

  var mailOptions = {
    from: "smartplatformsc@gmail.com",
    to: user.email,
    subject: "ERC20 based SM",
    text: "this is an ERC20 complient smart contract automatically developed by the smart platform \n This smart contract is developed along the features that are considered important by XinFin",
    attachments: [{
      filename: "coin.sol",
      content: result
    }]
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return;
    }
  });
  res.json({
    contract: result
  });
}

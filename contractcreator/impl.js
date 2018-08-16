const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");


var templateCoin;
var mintableContract;
var burnableContract;
var releaseableContract;
var upgradeableContract;

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

  exports.createContract = async function(req, res) {
    if (req.user) {
      var userDir = path.resolve(
        __dirname,
        "..",
        "allContracts",
        req.user.emailID
      );
      var fs = require("fs");

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }
      console.log(req.user);
      const currentUser = await User.findOne({ googleId: req.user.googleId })
      console.log(currentUser);
      if (currentUser.authorized && currentUser.countLeft >= 1) {
        if (req.body.tokenType == "recomm") {
          console.log(req.body);
          var fs = require("fs");
          fs.readFile(
            path.resolve(__dirname, "..", "coin.sol"),
            "utf8",
            async function(err, data) {
              if (err) {
                return console.log(err);
              }

              const pricePerToken = Math.floor(
                10 ** 18 / parseInt(req.body.ethToToken)
              );
              var mapObj = {
                tokenNameRoady: req.body.tokenName,
                tokenSymbolRoady: req.body.tokenSymbol.toString(),
                tokenDecimalsRoady: req.body.tokenDecimals.toString(),
                tokenTotalSupplyRoady: req.body.tokenTotalSupply.toString(),
                tokenOnSaleRoady: req.body.tokenOnSale.toString(),
                tokenPricePerTokenRoady: pricePerToken.toString()
              };
              var result = data.replace(
                /tokenNameRoady|tokenSymbolRoady|tokenDecimalsRoady|tokenTotalSupplyRoady|tokenOnSaleRoady|tokenPricePerTokenRoady/gi,
                function(matched) {
                  return mapObj[matched];
                }
              );
              var count = currentUser.count + 1;
              var name = count + ".sol";
              var countLeft = currentUser.countLeft -1;
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
                text:
                  "this is an ERC20 complient smart contract automatically developed by the smart platform \n This smart contract is developed along the features that are considered important by XinFin",
                attachments: [{ filename: "coin.sol", content: result }]
              };

              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                  return;
                }
              });

              res.json({ contract: result });
              await User.update(
                { googleId: req.user.googleId },
                { $set: { count: count, countLeft:countLeft } }
              );
            }
          );
        } else {
          // custom token
          var fs = require("fs");
          var mint = "";
          var allContracts = "";
          var release = "";
          var upgrade = "";
          var burn = "";
          var upgradeConRoady = "";
          const pricePerToken = Math.floor(
            10 ** 18 / parseInt(req.body.ethToToken)
          );

          console.log("inside custom");
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
      } else {
        res.json({ invalidRequest: true });
      }
    }
  };

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
    var upgradeConRoady = "";
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
          upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
        } else {
          // r,u,m
          mint = mintableContract;
          release = releaseableContract;
          upgrade = upgradeableContract;
          allContracts = "Mintable";
          upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
        }
      } else if (burnable) {
        // r,u,b
        release = releaseableContract;
        burn = burnableContract;
        upgrade = upgradeableContract;
        allContracts = "Burnable";
        upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
      } else {
        // r & u
        mint = mintableContract;
        release = releaseableContract;
        allContracts = "ReleasableToken,CMBUpgradeableToken";
        upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
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
          upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
          allContracts = "Burnable,Mintable";
        } else {
          // u,m
          mintableContract = mintableContract.replace(
            /ReleasableToken,CMBUpgradeableToken/g,
            "ERC20,Ownable,CMBUpgradeableToken"
          );
          mint = mintableContract;
          upgrade = upgradeableContract;
          upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
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
        upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
        allContracts = "Burnable";
      } else {
        // u
        upgrade = upgradeableContract;
        upgradeConRoady = "CMBUpgradeableToken(msg.sender)";
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
      upgradeableTokenRoady: upgrade,
      releaseableTokenRoady: release,
      mintableTokenRoady: mint,
      burnableTokenRoady: burn,
      allContractsRoady: allContracts,
      tokenNameRoady: body.tokenName,
      tokenSymbolRoady: body.tokenSymbol.toString(),
      tokenDecimalsRoady: body.tokenDecimals.toString(),
      tokenTotalSupplyRoady: body.tokenTotalSupply.toString(),
      tokenOnSaleRoady: body.tokenOnSale.toString(),
      tokenPricePerTokenRoady: pricePerToken.toString(),
      upgradeConRoady: upgradeConRoady
    };
    var result = template.replace(
      /upgradeableTokenRoady|releaseableTokenRoady|mintableTokenRoady|burnableTokenRoady|allContractsRoady|tokenNameRoady|tokenSymbolRoady|tokenDecimalsRoady|tokenTotalSupplyRoady|tokenOnSaleRoady|tokenPricePerTokenRoady|upgradeConRoady/gi,
      function(matched) {
        return mapObj[matched];
      }
    );
    var count = user.count + 1;
    var name = count + ".sol";
    var countLeft = user.countLeft -1;
    console.log(name);
    fs.writeFile(
      path.resolve(__dirname, "..", "allContracts", user.emailID, name),
      result,
      "utf8",
      function(err) {
        if (err) return console.log(err);
      }
    );

    var mailOptions = {
      from: "smartplatformsc@gmail.com",
      to: user.emailID,
      subject: "ERC20 based SM",
      text:
        "this is an ERC20 complient smart contract automatically developed by the smart platform \n This smart contract is developed along the features that are considered important by XinFin",
      attachments: [
        {
          filename: "coin.sol",
          content: result
        }
      ]
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        return;
      }
    });
    res.json({ contract: result });

    await User.update({ googleId: user.googleId }, { $set: { count: count } });
  }

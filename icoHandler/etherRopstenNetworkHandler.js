var db = require('../database/models/index');
var config = require('../config/paymentListener');
var balance = require('crypto-balances');
let Promise = require('bluebird');
const Web3 = require('web3');
var web3 = new Web3();
var provider = new Web3.providers.WebsocketProvider(config.testnetProvider);
web3.setProvider(provider);

module.exports = {
    checkBalance: (address) => {
        return new Promise(function (resolve, reject) {
            balance(address, function (err, result) {
                if (err)
                    reject(err);
                resolve(result[0].quantity);
            });
        });
    },

    checkEtherBalance: (address) => {
        return new Promise(function (resolve, reject) {
            web3.eth.getBalance(address).then(balance => {
                resolve(web3.utils.fromWei(balance));
            }).catch(error => {
                console.log("Web3 error status", error);
                provider = new Web3.providers.WebsocketProvider(ws_provider);
                web3.setProvider(provider);
                reject(error);
            });
        });
    },

    checkTokenBalance: async (address, tokenAddress) => {
        console.log(tokenAddress);
        return new Promise(async function (resolve, reject) {
            var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
            decimals = await tokenContractInstance.methods.decimals().call();
            tokenContractInstance.methods.balanceOf(address).call().then(balance => {
                resolve(balance / 10 ** decimals);
            }).catch(async error => {
                provider = new Web3.providers.WebsocketProvider(ws_provider);
                web3.setProvider(provider);
                reject(error);
            });
        });
    },

    buyToken: (fromAddress, toAddress, privateKey, value) => {
        var amountToSend = web3.utils.toWei(value, 'ether');
        return new Promise((resolve, reject) => {
            var transaction = {
                "from": fromAddress,
                "to": toAddress,
                "value": amountToSend
            };
            web3.eth.estimateGas(transaction).then(gasLimit => {
                transaction["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(transaction, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction).then(receipt => {
                        resolve(receipt);
                    });
                }).catch(async error => {
                    provider = new Web3.providers.WebsocketProvider(ws_provider);
                    web3.setProvider(provider);
                    reject(error);
                });
            });
        });
    },

    sendTokenFromTokenContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
        var contractfunc = new web3.eth.Contract(config.erc20ABI, projectData.tokenContractAddress, { from: address });
        let data = contractfunc.methods.sendTokensToCrowdsale('0x' + (tokenAmount).toString(16), tokenAddress).encodeABI()
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "to": projectData.tokenContractAddress,
            "data": data,
        }
        console.log("encoded Abi",txData)
        return new Promise(async function (resolve, reject) {
            web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('confirmation', async function (confirmationNumber, receipt) {
                            if (confirmationNumber == 1) {
                                if (receipt.status == true) {
                                    resolve(receipt)
                                }
                            }
                        })
                        .on('error', async function (error) {
                            console.log("Error while transferring token".error)
                            reject(error) 
                            })
                })
            })
        })
    },

    // sendTokenFromcrowdsaleContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
    //     var contractfunc = new web3.eth.Contract(config.crowdsaleABI, projectData.crowdsaleContractAddress, { from: address });
    //     let data = contractfunc.methods.dispenseTokensToInvestorAddressesByValue(tokenAddress, tokenAmount).encodeABI();
    //     let txData = {
    //         "nonce": await web3.eth.getTransactionCount(address),
    //         "data": data,
    //         'to': projectData.crowdsaleContractAddress,
    //     }
    //     return new Promise(async function (resolve, reject) {
    //         web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
    //             console.log(gasLimit);
    //             txData["gasLimit"] = gasLimit;
    //             web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
    //                 web3.eth.sendSignedTransaction(result.rawTransaction)
    //                     .on('confirmation', async function (confirmationNumber, receipt) {
    //                         if (confirmationNumber == 1) {
    //                             if (receipt.status == true) {
    //                                 resolve(receipt)
    //                             }
    //                         }
    //                     })
    //                     .on('error', async function (error) { reject(error) })
    //             })
    //         })
    //     })
    // },

    checkTokenStats: async (tokenAddress) => {
        return new Promise(async function (resolve, reject) {
            var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
            var decimals = await tokenContractInstance.methods.decimals().call();
            console.log(decimals);
            resolve(decimals);
        });
    },

    sendEther: async (address, amount) => {
        return new Promise(async function (resolve, reject) {
            const web3Ropsten = new Web3(
                new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/02804fed8a0244ab9cf60f13abebd0a7")
              );
            var mainPrivateKey = '0x25F8170BA33240C0BD2C8720FE09855ADA9D07E38904FC5B6AEDCED71C0A3142';
            var txData = {
                "nonce": await web3Ropsten.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
                "to": address,
                "value": amount, // "0x06f05b59d3b200000"
            }
            web3Ropsten.eth.estimateGas(txData).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = '0x5208';
                web3Ropsten.eth.accounts.signTransaction(txData, mainPrivateKey).then(result => {
                    console.log("signed: ", result)
                    web3Ropsten.eth.sendSignedTransaction(result.rawTransaction)
                        .on('receipt',  (receipt) => {console.log("receipt send ether:", receipt); resolve(receipt) })
                        .on('error',  (error) => {console.log("error send ether:", error); reject(error) })
                })
            })
        })
    },

    sendTransaction: async (address,abi, data, privKey) => {
        return new Promise(async function (resolve, reject) {




try {
    console.log('params: ', address, abi, data, privKey)
    const web3Ropsten = new Web3(
        new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/02804fed8a0244ab9cf60f13abebd0a7")
      );    
    const account = web3Ropsten.eth.accounts.privateKeyToAccount(privKey);
    const nonce = await web3Ropsten.eth.getTransactionCount(account.address);
    const gasPrice = await web3Ropsten.eth.getGasPrice();
    let rawTx = {
      from: account.address,
      data: "0x"+data,
      gas: 5000000,
      gasPrice: gasPrice,
      nonce: nonce,
      chainId: 3
    };
    let signedTransaction = await web3Ropsten.eth.accounts.signTransaction(
      rawTx,
      privKey
    );
    web3Ropsten.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .on("receipt", receipt => {
        if (receipt.status === true) {
          console.log("Contract Generated: ",receipt.contractAddress);
          resolve(receipt);
        } else {
          console.log("error");
          console.log("contract execution failed");
          console.log("receipt: ", receipt);
          reject(receipt);
        }
      })
      .catch(e => {
        console.log("error");
        console.log("contract execution failed");
        console.error(e);
        reject(e)
      });
  } catch (e) {
    console.log("error");
    console.log("error at deploy, ", e);
    reject(e)
  }




// Old Version, doesn't work
// !inconsistent
// !web3.eth.estimategGas doesn't work well with data

            // let txData = {
            //     "nonce": await web3.eth.getTransactionCount(address),
            //     "data": '0x' + data,
            //     "gasPrice": "0x170cdc1e00",
            //     // "gasLimit": "0x2625A0",
            // }
            // web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
            //     console.log(gasLimit);
            //     txData["gasLimit"] = gasLimit;
            //     web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
            //         web3.eth.sendSignedTransaction(result.rawTransaction)
            //             .on('confirmation', async function (confirmationNumber, receipt) {
            //                 if (confirmationNumber == 3) {
            //                     if (receipt.status == true) {
            //                         resolve(receipt)
            //                     }
            //                 }
            //             })
            //             .on('error', async function (error) { reject(error) })
            //     })
            // })
        })
    }
}

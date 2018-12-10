var db = require('../database/models/index');
var config = require('../config/paymentListener');
var balance = require('crypto-balances');
let Promise = require('bluebird');
const Web3 = require('web3');
var web3 = new Web3();
var provider = new Web3.providers.WebsocketProvider(config.ws_provider);
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

    sendTokenFromTokenContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
        var contractfunc = new web3.eth.Contract(config.erc20ABI, projectData.tokenContractAddress, { from: address });
        let data = contractfunc.methods.sendTokensToCrowdsale('0x' + (tokenAmount).toString(16), tokenAddress).encodeABI()
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "to": projectData.tokenContractAddress,
            "data": data,
        }
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
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    },

    // sendTokenFromcrowdsaleContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
    //     var contractfunc = new web3.eth.Contract(config.crowdsaleABI, projectData.tokenContractAddress, { from: address });
    //     let data = contractfunc.methods.dispenseTokensToInvestorAddressesByValue(tokenAddress, tokenAmount).encodeABI();
    //     let txData = {
    //         "nonce": await web3.eth.getTransactionCount(address),
    //         "data":  data,
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

    checkTokenStats: async (tokenAddress) => {
        return new Promise(async function (resolve, reject) {
            var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
            var decimals = await tokenContractInstance.methods.decimals().call();
            console.log(decimals);
            resolve(decimals);
        });
    },

    sendTransaction: async (address, data, privateKey) => {
        return new Promise(async function (resolve, reject) {
            let txData = {
                "nonce": await web3.eth.getTransactionCount(address),
                "data": '0x' + data,
            }
            web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('confirmation', async function (confirmationNumber, receipt) {
                            if (confirmationNumber == 3) {
                                if (receipt.status == true) {
                                    resolve(receipt)
                                }
                            }
                        })
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    }
}

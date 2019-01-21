var db = require('../database/models/index');
var config = require('../config/paymentListener');
var balance = require('crypto-balances');
let Promise = require('bluebird');
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(config.privateProvider));



module.exports = {
    checkTokenBalance: async (address, tokenAddress) => {
        return new Promise(async function (resolve, reject) {
            var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
            decimals = await tokenContractInstance.methods.decimals().call();
            tokenContractInstance.methods.balanceOf(address).call().then(balance => {
                resolve(balance / 10 ** decimals);
            }).catch(async error => {
                provider = new Web3.providers.HttpProvider(config.privateProvider);
                web3.setProvider(provider);
                reject(error);
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
    sendEther: async (address, amount) => {
        var mainPrivateKey = '0x25F8170BA33240C0BD2C8720FE09855ADA9D07E38904FC5B6AEDCED71C0A3142';
        console.log(await web3.eth.getBalance('0x14649976AEB09419343A54ea130b6a21Ec337772'), "here")
        var txData = {
            "nonce": await web3.eth.getTransactionCount('0x14649976AEB09419343A54ea130b6a21Ec337772'),
            "to": address,
            "value": amount, // "0x06f05b59d3b200000"
        }
        return new Promise(async function (resolve, reject) {
            web3.eth.estimateGas(txData).then(gasLimit => {
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, mainPrivateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('receipt', async function (receipt) { resolve(receipt) })
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    },

    sendTokenFromTokenContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
       
        var contractfunc = new web3.eth.Contract(config.erc20ABI, projectData.tokenContractAddress, { from: address });
        let data = contractfunc.methods.sendTokensToCrowdsale('0x' + (tokenAmount).toString(16), tokenAddress).encodeABI()
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "to": projectData.tokenContractAddress,
            "data": data,
            "chainId": 786786143
        }
        return new Promise(async function (resolve, reject) {
            web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('receipt', async function (receipt) {
                            resolve(receipt)
                            console.log(receipt);
                        })
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    },

    sendTokenFromCrowdsaleContract: async (projectData, address, tokenAmount, tokenAddress, privateKey) => {
        var contractfunc = new web3.eth.Contract(projectData.crowdsaleABICode, projectData.crowdsaleContractAddress, { from: address });
        let data = contractfunc.methods.sendTokensToCrowdsale('0x' + (tokenAmount).toString(16), tokenAddress).encodeABI()
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "to": projectData.crowdsaleContractAddress,
            "data": data,
        }
        return new Promise(async function (resolve, reject) {
            web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('receipt', async function (receipt) { resolve(receipt) })
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    },

    sendTransaction: async (address, data, privateKey) => {
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "data": '0x' + data,
        }
        return new Promise(async function (resolve, reject) {
            web3.eth.estimateGas({ data: txData.data, from: address }).then(gasLimit => {
                console.log(gasLimit);
                txData["gasLimit"] = gasLimit;
                web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
                    web3.eth.sendSignedTransaction(result.rawTransaction)
                        .on('receipt', async function (receipt) { resolve(receipt) })
                        .on('error', async function (error) { reject(error) })
                })
            })
        })
    },
}


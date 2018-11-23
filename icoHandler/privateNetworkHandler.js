var db = require('../database/models/index');
var config = require('../config/paymentListener');
var balance = require('crypto-balances');
let Promise = require('bluebird');
const Web3 = require('web3');
var web3 = new Web3(new Web3(new Web3.providers.HttpProvider(config.privateProvider)));
providerHandler(provider, ws_provider, web3);

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
                });
            });
        });
    },

    checkTokenStats: async (tokenAddress, provider) => {
        var web3 = new Web3(provider);
        return new Promise(async function (resolve, reject) {
            var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
            var decimals = await tokenContractInstance.methods.decimals().call();
            console.log(decimals);
            resolve(decimals);
        });
    },

    sendEther: async (address, amount) => {
        var mainPrivateKey = '0xdf11b6debfa783dbc46afd4d753a6dc39caa785c1b3e749f087fc1d4f0552f6c';
        var txData = {
            "nonce": await web3.eth.getTransactionCount('0xbF456F32Fed09Ee730a4263DCc9c1B48E422Dfb5'),
            "to": address,
            "value": amount, // "0x06f05b59d3b200000"
        }
        web3.eth.estimateGas(txData).then(gasLimit => {
            txData["gasLimit"] = gasLimit;
            web3.eth.accounts.signTransaction(txData, mainPrivateKey).then(result => {
                web3.eth.sendSignedTransaction(result.rawTransaction)
                    .on('receipt', async function (receipt) { resolve(receipt) })
                    .on('error', async function (error) { resolve(error) })
            })
        })
    },

    sendTransaction: async (address, data, privateKey) => {
        let txData = {
            "nonce": await web3.eth.getTransactionCount(address),
            "data": '0x' + data,
            "gasPrice": "0x170cdc1e00",
            "gasLimit": "0x2dc6c0",
        }
        web3.eth.accounts.signTransaction(txData, privateKey).then(result => {
            web3.eth.sendSignedTransaction(result.rawTransaction)
                .on('receipt', async function (receipt) { resolve(receipt) })
                .on('error', async function (error) { resolve(error) })
        })
    }
}

function providerHandler(provider, ws_provider, web3) {
    provider.on('connect', () => console.log('ICO WS Connected'))
    provider.on('error', e => {
        console.log('WS error occured');
        console.log('Attempting to reconnect...');
        provider = new Web3.providers.WebsocketProvider(ws_provider);
        web3.setProvider(provider);
    });
    provider.on('end', e => {
        console.log('WS closed');
        console.log('Attempting to reconnect...');
        provider = new Web3.providers.WebsocketProvider(ws_provider);
        web3.setProvider(provider);
    });
}

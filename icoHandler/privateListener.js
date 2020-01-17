var db = require('../database/models/index');
var client = db.client;
var Address = db.userCurrencyAddress;
var config = require('../config/paymentListener');
var balance = require('crypto-balances');
let Promise = require('bluebird');
const Web3 = require('web3');
var ws_provider = "wss://ropsten.infura.io/ws/v3/02804fed8a0244ab9cf60f13abebd0a7";
var web3 = new Web3();
var provider = new Web3.providers.WebsocketProvider(ws_provider);
web3.setProvider(provider);
providerHandler(provider, ws_provider, web3);

module.exports = {
  checkBalance: (address) => {
    return new Promise(function(resolve, reject) {
      balance(address, function(err, result){
        if(err)
          reject(err);
        resolve(result[0].quantity);
      });
    });
  },

  checkTokenBalance: async (address, tokenAddress) => {
    console.log(tokenAddress);
    return new Promise(async function(resolve, reject) {
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

  buyTokenIdeal: async (address, tokenAddress, privateKey, value) => {
    var amountToSend = web3.utils.toWei(value, 'ether');
    return new Promise(function(resolve, reject) {
      var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
      var transaction = {
        "from": address,
        "to": tokenAddress,
        "value": amountToSend,
        "data": tokenContractInstance.methods.buyTokens().encodeABI()
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

  checkTokenStats: async (tokenAddress) => {
    return new Promise(async function(resolve, reject) {
      var tokenContractInstance = new web3.eth.Contract(config.erc20ABI, tokenAddress);
      var decimals = await tokenContractInstance.methods.decimals().call();
      console.log(decimals);
      var onSaleTokens = await tokenContractInstance.methods.onSaleTokens.call().call();
      resolve(onSaleTokens / 10 ** decimals);
    });
  },

  getTransactions: async (address) => {
    return new Promise(async function(resolve, reject) {
      web3.eth.getPastLogs({
          fromBlock: '0x0',
          address: address
        })
        .then(res => {
          console.log(res);
          res.forEach(rec => {
            resolve(rec);
            console.log(rec.blockNumber, rec.transactionHash, rec.topics);
          });
        }).catch(err => console.log("getPastLogs failed", err));

    });
  }
}

function providerHandler(provider, ws_provider, web3) {
  provider.on('connect', () => console.log('ICO Private WS Connected'))
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

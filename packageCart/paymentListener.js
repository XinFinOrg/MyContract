const Web3 = require('web3');
var db = require('../database/models/index');
var client = db.client;
var Address = db.userCurrencyAddress;
var ws_provider = 'wss://mainnet.infura.io/ws';
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);
let Promise = require('bluebird');
provider.on('error', e => console.log('WS Error', e));
provider.on('end', e => {
  console.log('WS closed');
  console.log('Attempting to reconnect...');
  provider = new Web3.providers.WebsocketProvider(ws_provider);

  provider.on('connect', function() {
    console.log('WSS Reconnected');
  });

  web3.setProvider(provider);
});
var config = require('../config/paymentListener');
var contractInstance = new web3.eth.Contract(config.erc20ABI, config.tokenAddress);
var gasPriceGwei = 10;
module.exports = {
  attachListener: (address) => {
    contractInstance.once('Transfer', {
      filter: {
        from: address
      },
      fromBlock: 'pending',
      toBlock: 'latest'
    }, function(err, res) {
      console.log(err, res.returnValues);
      Address.find({
        where: {
          address: address
        }
      }).then(address => {
        address.getClient().then(async client => {
          client.package1 += 1;
          await client.save();
        });
      });
    });
  },

  sendToParent: (address, privateKey) => {
    return new Promise(async function(resolve, reject) {
      var amountToSend = web3.utils.toWei('0.0005', 'ether');
      var rawTransaction = {
        "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
        "gasLimit": web3.utils.toHex(30000),
        "to": address,
        "value": amountToSend
      };
      web3.eth.accounts.signTransaction(rawTransaction, "0xD493D7F8F82C24BBFC3FE0E0FB14F45BAA8EA421356DC2F7C2B1A9EF455AB8DF").then(result => {
        web3.eth.sendSignedTransaction(result.rawTransaction).then(receipt => {
          console.log("Ether receipt generated");
          var transaction = {
            "from": address,
            "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
            "to": config.tokenAddress,
            "value": "0x0",
            "data": contractInstance.methods.transfer(config.diversionAddress,config.amount).encodeABI()
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
      });
    });
  },

  checkBalance: (address) => {
    return new Promise(async function(resolve, reject) {
      var balance = await contractInstance.methods.balanceOf(address).call();
      resolve(balance / 10 ** 18);
    });
  },

  checkEtherBalance: (address) => {
    return new Promise(async function(resolve, reject) {
      var balance = await web3.eth.getBalance(address);
      resolve(web3.utils.fromWei(balance));
    });
  }
}

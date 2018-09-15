const Web3 = require('web3');
var db = require('../database/models/index');
var client = db.client;
var Address = db.userCurrencyAddress;
var Package = db.pac
var ws_provider = 'wss://mainnet.infura.io/ws'
var web3 = new Web3(new Web3.providers.WebsocketProvider(ws_provider))
var config = require('../config/paymentListener');
var contractInstance = new web3.eth.Contract(config.erc20ABI, config.tokenAddress);
var Tx = require('ethereumjs-tx');
console.log("listener started");
contractInstance.events.Transfer({
  fromBlock: 0,
  toBlock: 'latest'
}, function(err, res) {
  if (res) {
    console.log(err, res.returnValues.to);
    console.log(global.paymentAddresses);
    if (global.paymentAddresses.indexOf(res.returnValues.to) != -1) {

      Address.find({
        where: {
          address: res.returnValues.to
        }
      }).then(address => {
        address.getClient().then(async client => {
          client.package1 += 1;
          await client.save();

          /**Author : Nishant
          *implementation to sweep funds. lacks sending ethers mechanism
          */
          // sendToParent(address.address, address.privateKey);
        });
      })
    }
  }

});

async function sendToParent(address, privateKey) {
  console.log(address);
  var balance = await contractInstance.methods.balanceOf(address).call();
  console.log(balance);
  var gasPriceGwei = 3;
    var gasLimit = 3000000;
    // Chain ID of Ropsten Test Net is 3, replace it to 1 for Main Net
    var chainId = 3;
    var count = await web3.eth.getTransactionCount(address);
    var rawTransaction = {
        "from": address,
        "nonce": "0x" + count.toString(16),
        "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": config.tokenAddress,
        "value": "0x0",
        "data": contractInstance.methods.transfer(config.diversionAddress, balance).encodeABI(),
        "chainId": chainId
    };
    var tx = new Tx(rawTransaction);
    var privateKeyBuffer = new Buffer(privateKey.substring(2), 'hex');
    tx.sign(privateKeyBuffer);
    var serializedTx = tx.serialize();
    var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    // The receipt info of transaction, Uncomment for debug
    console.log(receipt);
    // The balance may not be updated yet, but let's check
    balance = await contractInstance.methods.balanceOf(address).call();
}

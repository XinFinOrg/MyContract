var options = require('../config/coinPayments').options;
var Coinpayments = require('coinpayments');
const client = new Coinpayments(options);
let Promise = require('bluebird');

module.exports = {

  buyToken: (currency1, currency2, amount, buyer_email) => {
    return new Promise((resolve, reject) => {
      client.createTransaction({'currency1' : currency1, 'currency2' : currency2, 'amount' : amount, 'buyer_email':buyer_email}).then(txInfo => {
        resolve(txInfo);
      });
    })
  }
}

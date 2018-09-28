var options = require('../config/coinPayments').options;
var Coinpayments = require('coinpayments');
const client = new Coinpayments(options);
client.getBasicInfo().then(info => {
  console.log(info);
});


// client.createTransaction({'currency1' : 'USD', 'currency2' : 'LTCT', 'amount' : 1, 'buyer_email':'nishant.mitra94@gmail.com'}).then(txInfo => {
//   console.log(txInfo);
// });

const Web3 = require('web3');
const keythereum = require('keythereum');
const ethTx = require('ethereumjs-tx');
const sleep = require('sleep');

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/78791c2bd8794f2693aa31db1ae6d4f3'));
}

 web3.eth.subscribe('newBlockHeaders', function(error, result){
    if (!error) {
        console.log(result);

        return;
    }

    console.error(error);
})
.on("data", function(blockHeader){
    console.log(blockHeader);
})
.on("error", console.error);

// console.log("Hello");
// var blockNo = 0;

// // function checkForNewBlock() {
// //     var number = web3.eth.blockNumber;
// //     return number;
// // }
// while (true) {
//             var numbers = 0;
//         console.log("number ", numbers);
//         var blockData = web3.eth.getBlock("latest");
//         console.log("details:",blockData.number);
//         var txData;
//         var i = 0;
//         for (i = 0; i < blockData.transactions.length; i++) {
//             txData = web3.eth.getTransaction(blockData.transactions[i]);
//             if (txData.to == "0x464f383020dd7c8efd7db843049dabdd729d4c92") {
//                 console.log("transaction detected");
//                 console.log("txData", txData);
//             } 
//             else{
//                 console.log(" No transaction");
//             }
//         }

// }

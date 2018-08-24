var bcrypt = require('bcrypt-nodejs');
var keythereum = require("keythereum");
const Sequelize = require('sequelize');
const sequelize = new Sequelize('autoCoin', 'Akshay', '123', {
  host: 'localhost',
  dialect: 'postgres',
});

var Client = sequelize.define('client', {
    Name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    ethereumAccount: {
      type: Sequelize.STRING
    },
    cipher: {
      type: Sequelize.STRING
    },
    balance: {
      type: Sequelize.NUMERIC
    },
    password: {
      type: Sequelize.STRING
    },
    github_id: {
      type: Sequelize.STRING
    },
    google_id: {
      type: Sequelize.STRING
    },
    contractAddress: {
      type: Sequelize.STRING
    },
    contractTxHash: {
      type: Sequelize.STRING
    }, 
    package1: {
      type: Sequelize.BOOLEAN
    }, 
    package2: {
      type: Sequelize.BOOLEAN
    }, 
    package3: {
      type: Sequelize.BOOLEAN
    },
  });


  module.exports=Client

  // force: true will drop the table if it already exists
// Client.sync({force: true}).then(() => {
//     console.log("Table created");
//     // return Client.create({
//     //   Name: 'John',
//     //   email: 'Hancock'
//     // });
//   });


// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var keythereum = require("keythereum");
// var Web3 = require('web3');
// var web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
// define the schema for our user model
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  ethereumAccount: String,
  cipher: String,
  balance: Number,
  password: String,
  github_id: String,
  google_id: String,
  packages: {
    package_1: {type: Boolean, default: false},
    package_2: {type: Boolean, default: false},
    package_3: {type: Boolean, default: false}
  },
  //contract data
  contractAddress:String,
  contractTxHash:String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.generateNewAccount = function(password){
  var params = { keyBytes: 32, ivBytes: 16 };
  var dk = keythereum.create(params);
  return keythereum.dump(password, dk.privateKey, dk.salt, dk.iv)
};

userSchema.methods.generateCipher = function(){
  return cipher = bcrypt.hashSync(((Math.random()* (99999 - 10000)) + 10000), bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

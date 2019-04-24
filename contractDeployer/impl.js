var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var byteCode2;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
var userCurrencyAddress = db.userCurrencyAddress;
var ejs = require("ejs");
var fileReader = require('../filereader/impl');
var contractDeployerListener = require('./contractDeployerListener');
var config = require('../config/paymentListener');
var privateICOhandler = require('../icoHandler/privateNetworkHandler')
var etherRopstenICOhandler = require('../icoHandler/etherRopstenNetworkHandler')
var etherMainnetICOhandler = require('../icoHandler/etherMainNetworkHandler')
var nodemailerservice = require('../emailer/impl');
var Tx = require('ethereumjs-tx');
const Web3 = require('web3');
var ws_provider = config.ws_provider;
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);

module.exports = {
  projectContractData: async function (req, res) {
    ProjectConfiguration.find({
      where: {
        'coinName': req.body.tokenName
      },
    }).then(projectData => {
      if (projectData == null) {
        res.send({ status: false, message: "no data found" })
      }
      else {
        res.send({
          status: true,
          network: projectData.networkType,
          tokenContract: {
            "smartContract": projectData.tokenContractCode,
            "bytecode": projectData.tokenByteCode,
            "interface": projectData.tokenABICode,
            "address": projectData.tokenContractAddress
          },
          crowdsaleContract: {
            "smartContract": projectData.crowdsaleContractCode,
            "bytecode": projectData.crowdsaleByteCode,
            "interface": projectData.crowdsaleABICode,
            "address": projectData.crowdsaleContractAddress
          }
        })
      }
    })
  },
  getAutomaticDeployer: async function (req, res) {
    var type = req.body.type;
    let projectData = await ProjectConfiguration.find({ where: { 'coinName': req.body.coinName, 'client_id': req.user.uniqueId } });
    if (projectData == null) {
      console.log("herewS")
      res.send({ status: false, message: "No data found!" });
    } else {
      let accountData = await userCurrencyAddress.find({ where: { 'client_id': req.user.uniqueId, 'currencyType': 'Ethereum', 'project_id': req.body.coinName } })
      projectData.crowdsaleContractAddress = "Deployment is in process";
      projectData.tokenContractAddress = "Deployment is in process";
      projectData.networkType = req.body.network;
      projectData.networkURL = "#"
      await projectData.save();
      // res.send({status:true,message:"Deployment is in process"})
      if (req.body.network == 'private') {
        try {
          privateICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
            .then(async r => {
              contractDeployerListener.createAutomaticDeployer(req,projectData,accountData);
              res.send({status:true,message:"Deployment is in process"})
            })
            .catch(e => res.status(400).send({ status: false, message: "Network error occured! Please try again" })
            );
        } catch (e) {
          res.status(400).send({ status: false, message: "Network error occured! Please try again" })
        }
      }
      else if (req.body.network == 'testnet') {
        try {
          console.log("inside ether send testnet")
          etherRopstenICOhandler.sendEther(accountData.address, '0x06f05b59d3b20000')
            .then(async r => {
              console.log("ether sent");
              res.send({status:true,message:"Deployment is in process"})
              console.log('inside automatic deployer');
              contractDeployerListener.createAutomaticDeployer(req,projectData,accountData,type);
              console.log('inside automatic deployer2');
              // res.send({"status":"working"});
            })
            .catch(e => res.status(400).send({ status: false, message: "Network error occured! Please try again" })
            );
        } catch (e) {
          contractDeployerListener.createAutomaticDeployer(req,projectData,accountData);
          res.status(400).send({ status: false, message: "Network error occured! Please try again" })
        }
      }
      else {
        try {
          
        } catch (e) {
          res.status(400).send({ status: false, message: "Network error occured! Please try again" })
        }
      }
    }
  }
}


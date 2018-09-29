var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;

module.exports = {

  getBytecode: async function (req, res) {
    console.log("re is", req.query);
    var coinName = req.query.coinName;
    // var coinName = "test";
    ProjectConfiguration.find({
      where: {
        'coinName': coinName
      },
      attributes: ['coinName', 'contractCode', 'contractByteCode']
    }).then(async projectData => {
      byteCode = projectData.contractByteCode;
      if (byteCode == null){
        // console.log(solc.compile(projectData.contractCode, 1).contracts[':Coin'])
        byteCode = solc.compile(projectData.contractCode, 1).contracts[':Coin'].bytecode;
        projectData.contractByteCode = byteCode;
        await projectData.save();
      }

      res.send({
        bytecode: byteCode
      })
    });
  },

  saveDeploymentData: async function (req, res) {
    console.log(req.body.resp, "dataaaaaa",req.body.resp.search("https://etherscan.io"));
    ProjectConfiguration.find({
      where: {
        'coinName': req.query.coinName
      },
      attributes: ['coinName', 'contractCode', 'contractByteCode']
    }).then(async updateddata => {
      if (req.body.resp.search("https://etherscan.io") != -1) {
        updateddata.networkType = "mainnet";
      } else {
        updateddata.networkType = "testnet"
      }
      updateddata.networkURL = req.body.resp;
      updateddata.contractHash = req.body.contractTxHash;
      updateddata.contractAddress = req.body.contractAddress;
      updateddata.save();
      req.session.contractAddress = req.body.contractAddress;
      req.session.contractTxHash = req.body.contractTxHash;
      req.flash('contract_flash', 'Contract mined successfully!');
      res.redirect('/dashboard');

    })
  },

  getDeployer: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'index.ejs'), {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
    // res.sendFile(path.join(__dirname, './', 'dist', 'index.html'));
  }
};

function getProjectArray(email) {
  var projectArray = [];
  return new Promise(async function (resolve, reject) {
    client.find({
      where: {
        'email': email
      },
      include: [{
        model: ProjectConfiguration,
        attributes: ['coinName', 'contractAddress', 'contractHash']
      }],
    }).then(client => {
      client.projectConfigurations.forEach(element => {
        projectArray.push(element.dataValues);
      });
      // res.send({'projectArray': projectArray});
      resolve(projectArray);
    });
  });
}

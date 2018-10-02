var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
var ejs = require("ejs");

module.exports = {
  getBytecode: async function (req, res) {
    var coinName = req.query.coinName;
    var address = req.cookies['address'];
    ProjectConfiguration.find({
      where: {
        'coinName': coinName
      },
      attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
    }).then(async projectData => {
      // console.log(projectData.dataValues)
      if (projectData.tokenContractAddress != null) {
        console.log("here 1");
        ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
          "TokenContractAddress": projectData.tokenContractAddress,
          "walletAddress": address,
          "rate": projectData.ETHRate
        }, async (err, data) => {
          if (err)
            console.log(err);
          byteCode = solc.compile(data, 1).contracts[':Coin'].bytecode;
          projectData.crowdsaleByteCode = byteCode;
          await projectData.save();
        });
      } else {
        console.log("here 2");
        byteCode = projectData.tokenByteCode;
        if (byteCode == null) {
          console.log("here 3",solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']);
          byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin'].bytecode;
          projectData.tokenByteCode = byteCode;
          await projectData.save();
        }
      }
      res.send({
        bytecode: byteCode
      })
    });
  },
  saveDeploymentData: async function (req, res) {
    console.log(req.body.resp, "dataaaaaa", req.body.resp.search("https://etherscan.io"));
    ProjectConfiguration.find({
      where: {
        'coinName': req.query.coinName
      },
      attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']    }).then(async updateddata => {
      if (req.body.resp.search("https://etherscan.io") != -1) {
        updateddata.networkType = "mainnet";
      } else {
        updateddata.networkType = "testnet"
      }
      updateddata.networkURL = req.body.resp;
      updateddata.tokenContractHash = req.body.contractTxHash;
      updateddata.tokenContractAddress = req.body.contractAddress;
      updateddata.save();
      req.session.contractAddress = req.body.contractAddress;
      req.session.contractTxHash = req.body.contractTxHash;
      req.flash('contract_flash', 'Contract mined successfully!');
      res.redirect('/crowdsaleDeployer');

    })
  },

  crowdsaleDeployer: async function (req, res) {
    var projectArray = await getProjectArray(req.user.email);
    var address = req.cookies['address'];
    res.render(path.join(__dirname, './', 'dist', 'crowdsaleDeployer.ejs'), {
      user: req.user,
      address: address,
      ProjectConfiguration: projectArray,
    });
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
  },
  test: async function (req,res) {
    ProjectConfiguration.find({
      where: {
        'coinName': "XDC"
      },
      attributes: ['coinName']
    }).then(async projectData => {
      res.send(a);
    })
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
        attributes: ['coinName', 'ETHRate', 'tokenContractAddress', 'tokenContractCode', 'tokenByteCode', 'tokenContractHash', 'crowdsaleContractAddress', 'crowdsaleContractCode', 'crowdsaleByteCode', 'crowdsaleContractHash']
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

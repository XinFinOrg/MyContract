var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;

module.exports = {

  getBytecode: async function(req, res) {
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

  saveDeploymentData: async function(req, res) {
    var projectdata = await client.find({
      where: {
        'email': req.user.email
      },
      include: ['projectConfigurations'],
    })
    await ProjectConfiguration.update({
      'contractAddress': req.body.contractAddress,
      'contractHash': req.body.contractTxHash
    }, {
      where: {
        client_id: projectdata.projectConfigurations[0].dataValues.client_id
      }
    }).then(updateddata => {
      if (!updateddata)
        console.log("Project update failed !");
      req.session.contractAddress = req.body.contractAddress;
      req.session.contractTxHash = req.body.contractTxHash;
      req.flash('contract_flash', 'Contract mined successfully!');
      res.redirect('/dashboard');

    })
  },

  getDeployer: async function(req, res) {
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
  return new Promise(async function(resolve, reject) {
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

var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;

module.exports = {

  getBytecode: async function(req, res) {
    var coinName = req.session.coinName;
    ProjectConfiguration.find({
      where: {
        'coinName': coinName
      },
      attributes: ['coinName', 'contractCode', 'contractByteCode']
    }).then(async projectData => {
      byteCode = projectData.contractByteCode;
      console.log(byteCode);
      if (byteCode == null){
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
      res.redirect('/generatedContract');

    })
  },

  getDeployer: function(req, res) {
    req.session.coinName = req.query.coinName;
    res.sendFile(path.join(__dirname, './', 'dist', 'index.html'));
  }
}

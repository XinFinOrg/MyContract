var fs = require('fs');
var path = require('path');
const solc = require("solc");
var byteCode;
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;




module.exports = {

  getBytecode: async function (req, res) {
    var projectdata = await client.find({
      where: {
        'email': req.user.email
      },
      include: ['projectConfigurations'],
    })
    fs.readFile(path.resolve(__dirname, "..", "./contractCreator/contractDirectory", req.user.email + "/" + projectdata.projectConfigurations[0].dataValues.coinName + ".sol"), "utf8",
      function (err, doc) {
        if (err) {
          return console.log(err);
        }
        byteCode = solc.compile(doc.toString(), 1).contracts[':Coin'];
        //file read for contract bytecode
        fs.writeFile(path.resolve(__dirname, "..", "./contractCreator/contractDirectory/" + req.user.email + "/" + projectdata.projectConfigurations[0].dataValues.coinName + ".bytecode"), byteCode.bytecode, {
          flag: 'w'
        }, function (err) {
          if (err) return console.log(err);
        });


        res.send({ bytecode: byteCode.bytecode })
      });
  },

  saveDeploymentData: async function (req, res) {
    var projectdata = await client.find({
      where: {
        'email': req.user.email
      },
      include: ['projectConfigurations'],
    })
    await ProjectConfiguration.update(
      { 'contractAddress': req.body.contractAddress, 'contractHash': req.body.contractTxHash },
      { where: { client_id: projectdata.projectConfigurations[0].dataValues.client_id } }).then(updateddata => {
        if (!updateddata)
          console.log("Project update failed !");
        req.session.contractAddress = req.body.contractAddress;
        req.session.contractTxHash = req.body.contractTxHash;
        console.log("Project updated successfully!");
        req.flash('contract_flash', 'Contract mined successfully!');
        res.redirect('/generatedContract');


      })
  },

  getDeployer: function (req, res) {
    res.sendFile(path.join(__dirname, './', 'dist', 'index.html'));
  }
}

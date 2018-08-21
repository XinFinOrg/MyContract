const mongoose = require("mongoose");
var User = require('../userlogin/models');
var fs = require('fs');
var path = require('path');

module.exports = {

    getBytecode: async function(req, res) {
        fs.readFile(path.resolve(__dirname, "..","./contractCreator/contractDirectory", req.user.email, req.user.email+".bytecode"), "utf8",
          function(err, doc) {
            if (err) {
              return console.log(err);
            }
            res.send({bytecode:doc})
          });
        },

    saveDeploymentData:async function (req,res) {
        User.findOneAndUpdate({email:req.user.email}, {$set:{contractAddress:req.body.contractAddress,contractTxHash:req.body.contractTxHash,"packages.package_2":false}}, function(err, doc){ 
            if(err){
                res.send("Something wrong when updating data!");
            }
                res.send("bytecode added");
          });
    },

    getDeployer: function(req, res) {
      res.sendFile(path.join(__dirname, './', 'dist', 'index.html'));
    }
}

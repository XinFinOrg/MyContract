const mongoose = require("mongoose");
var User = require('../userlogin/models');

module.exports = {

    getBytecode: async function(req, res) {
        User.findOne({email:req.session.user.email}, function(err, doc){
            if(err){
                console.log("Something wrong!");
            }
            console.log("fetched");
            res.send({bytecode:doc.bytecode})
          });
        },

    saveDeploymentData:async function (req,res) {
        console.log("deploy data",req.body);
        User.findOneAndUpdate({email:req.session.user.email}, {$set:{contractAddress:req.body.contractAddress,contractTxHash:req.body.contractTxHash}}, {new: true}, function(err, doc){ 
            if(err){
                res.send("Something wrong when updating data!");
            }
                res.send("bytecode added");
          });
    }
}
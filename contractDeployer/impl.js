var fs = require('fs');
var path = require('path');
var Client = require('../database/config');
const solc = require("solc");
var byteCode;


module.exports = {

    getBytecode: async function(req, res) {
        fs.readFile(path.resolve(__dirname, "..","./contractCreator/contractDirectory",req.user.email,req.session.token_name+".SOL"), "utf8",
          function(err, doc) {
            if (err) {
              return console.log(err);
            }
           byteCode=solc.compile(doc.toString(), 1).contracts[':Coin'];
            //file read for contract bytecode
            fs.writeFile(path.resolve(__dirname, "..","./contractCreator/contractDirectory/"+req.user.email+ "/" + req.session.token_name + ".bytecode"), byteCode.bytecode, {
              flag: 'w'
            }, function(err) {
              if (err) return console.log(err);
            });


            res.send({bytecode:byteCode.bytecode})
          });
        },

    saveDeploymentData:async function (req,res) {
        Client.update({'contractAddress':req.body.contractAddress,'contractTxHash':req.body.contractTxHash,'package2':false},{ 
            where: {'email':req.user.email}
          }).then(function(result) {
            if (!result)
            res.send("Something wrong when updating packages!");
      
            console.log("packages updated");
            res.redirect('/generatedContract');
        })
    },

    getDeployer: function(req, res) {
      res.sendFile(path.join(__dirname, './', 'dist', 'index.html'));
    }
}

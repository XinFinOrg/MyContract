var fs = require('fs');
var path = require('path');
var Client = require('../database/config');


module.exports = {

    getBytecode: async function(req, res) {
        fs.readFile(path.resolve(__dirname, "..","./contractCreator/contractDirectory", req.user.email, req.session.token_name+".bytecode"), "utf8",
          function(err, doc) {
            if (err) {
              return console.log(err);
            }
            res.send({bytecode:doc})
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

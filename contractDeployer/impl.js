const mongoose = require("mongoose");
var User = require('../userlogin/models');
var fs = require('fs');
var path = require('path');

module.exports = {

    getBytecode: async function(req, res) {
        // User.findOne({email:req.session.user.email}, function(err, doc){
        //     if(err){
        //         console.log("Something wrong!");
        //     }
        //     console.log("fetched");
        //     res.send({bytecode:doc.bytecode})
        //   });
        fs.readFile(path.resolve(__dirname, "..","./contractCreator/contractDirectory", req.session.user.email, req.session.user.email+".bytecode"), "utf8",
          function(err, doc) {
            if (err) {
              return console.log(err);
            }
            res.send({bytecode:doc})
          });

    }
}

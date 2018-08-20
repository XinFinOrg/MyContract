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

    }
}
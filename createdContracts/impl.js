var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;

module.exports ={
    getContracts : async function(req,res){
        try{
            let projectData = await ProjectConfiguration.find({ where: {'client_id': req.user.uniqueId}});
            if (projectData == null) {
                console.log("No project Data found")
                res.status(200).send({status:false,message:"No Contracts Found"});
            }
            else {
                let email = req.user.email;
                let projectData = await getProjectArray(email);
                console.log("project Data found",projectData)
                res.status(200).send(
                    {
                        status:true,
                        projects:projectData
                    });
            }
        }
        catch(e){
            console.log("Server Error",e);
                res.status(200).send({
                    status:false,
                    message:"Server Error"
                });
            }
    }
}

function getProjectArray(email) {
    var projectArray = [];
    return new Promise(async function (resolve, reject) {
      client.find({
        where: {
          'email': email
        },
        include: [{
          model: ProjectConfiguration,
          attributes: ['coinName','coinSymbol', 'tokenSupply','ETHRateinteger','tokenContractAddress', 'tokenContractHash', 'networkType', 'networkURL', 'crowdsaleContractAddress', 'crowdsaleContractHash']
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
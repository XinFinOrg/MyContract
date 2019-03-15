
const solc = require("solc");
var byteCode;
var byteCode2;
var ejs = require("ejs");
var fileReader = require('../filereader/impl');
var config = require('../config/paymentListener');
var privateICOhandler = require('../icoHandler/privateNetworkHandler')
var etherRopstenICOhandler = require('../icoHandler/etherRopstenNetworkHandler')
var etherMainnetICOhandler = require('../icoHandler/etherMainNetworkHandler')
var nodemailerservice = require('../emailer/impl');
const Web3 = require('web3');
var ws_provider = config.ws_provider;
var provider = new Web3.providers.WebsocketProvider(ws_provider);
var web3 = new Web3(provider);

module.exports =
{
    //this method is used to deploy contract to the preferend network separately
    createAutomaticDeployer: async function(req,projectData,accountData)
    {
        console.log('inside automatic deployerlistener');
        byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
        projectData.tokenByteCode = byteCode.bytecode;
        projectData.tokenABICode = byteCode.interface;
        //for ropsten network 
        if(req.body.network == 'tesnet')
        {
            
            etherRopstenICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
                .then(async tokenReceipt => {
                  console.log("Here:Ropsten Send Token reciept:",tokenReceipt)
                  projectData.tokenContractAddress = tokenReceipt.contractAddress;
                  projectData.tokenContractHash = tokenReceipt.transactionHash;
                  var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
                  var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
                  var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
                  ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                    "SafeERC20": SafeERC20,
                    "SafeMath": SafeMath,
                    "IERC20": IERC20,
                  }, async (err, data) => {
                    nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                    byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                    byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                    projectData.crowdsaleByteCode = byteCode2.bytecode;
                    projectData.crowdsaleABICode = byteCode2.interface;
                    projectData.crowdsaleContractCode = data;
                    etherRopstenICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                      .then(async crowdsaleReceipt => {
                        console.log("Here:Ropsten Send Crowdsale reciept:",crowdsaleReceipt)
                        projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                        projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                        await projectData.save();
                        // res.status(200).send({ tokenReceipt: tokenReceipt, crowdsaleReceipt: crowdsaleReceipt })
                      })
                      .catch(async e => {
                        console.error('error in 2st deployment', e)
                        projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                        projectData.tokenContractAddress = "Network error occured!  Please try again";
                        await projectData.save();
                        // res.status(400).send({ status: false, message: "Network error occured! Please try again" })
                      })
                  })
                })
                .catch(async e => 
                    {
                        console.error('error in 2st deployment', e)
                        projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                        projectData.tokenContractAddress = "Network error occured!  Please try again";
                        await projectData.save();
                    }
                    // res.status(400).send({ status: false, message: "Network error occured! Please try again" })
                );
        }
        //for xinfin network
        else if(req.body.network == 'private')
        {
            privateICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
              .then(async tokenReceipt => {
                // console.log(tokenReceipt, "here 2")
                projectData.tokenContractAddress = tokenReceipt.contractAddress;
                projectData.tokenContractHash = tokenReceipt.transactionHash;
                var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
                var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
                var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
                ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                  "SafeERC20": SafeERC20,
                  "SafeMath": SafeMath,
                  "IERC20": IERC20,
                }, async (err, data) => {
                  nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                  byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                  byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                  projectData.crowdsaleByteCode = byteCode2.bytecode;
                  projectData.crowdsaleABICode = byteCode2.interface;
                  projectData.crowdsaleContractCode = data;
                  privateICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                    .then(async crowdsaleReceipt => {
                      console.log(crowdsaleReceipt, "here 3")
                      projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                      projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                      await projectData.save();
                    //   res.status(200).send({ tokenReceipt: tokenReceipt, crowdsaleReceipt: crowdsaleReceipt })
                    })
                    .catch(async e => {
                      console.error('error in 2st deployment', e)
                      projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                      projectData.tokenContractAddress = "Network error occured!  Please try again";
                      await projectData.save();
                    //   res.status(200).send({ status: false, message: "Network error occured! Please try again" })
                        
                    })
                })
              })
              .catch(async e => 
                {
                    projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                    projectData.tokenContractAddress = "Network error occured!  Please try again";
                    await projectData.save();
                }
                // res.status(400).send({ status: false, message: "Network error occured! Please try again" })
              );
        }
        //for mainnet network(ethereum)
        else
        {
            byteCode = await solc.compile(projectData.tokenContractCode, 1).contracts[':Coin']
          projectData.tokenByteCode = byteCode.bytecode;
          projectData.tokenABICode = byteCode.interface;
          etherRopstenICOhandler.sendTransaction(accountData.address, byteCode.bytecode, accountData.privateKey)
            .then(async tokenReceipt => {
              res.send({status:true,message:"Deployment is in process"})
              projectData.tokenContractAddress = tokenReceipt.contractAddress;
              projectData.tokenContractHash = tokenReceipt.transactionHash;
              var IERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/IERC20.sol');
              var SafeERC20 = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeERC20.sol');
              var SafeMath = await fileReader.readEjsFile(__dirname + '/../contractCreator/ERC20contracts/SafeMath.sol');
              ejs.renderFile(__dirname + '/../contractCreator/ERC20contracts/Crowdsale.sol', {
                "SafeERC20": SafeERC20,
                "SafeMath": SafeMath,
                "IERC20": IERC20,
              }, async (err, data) => {
                nodemailerservice.sendContractEmail(req.user.email, data, req.body.coinName, "Crowdsale Contract");
                byteCode2 = await solc.compile(data, 1).contracts[':Crowdsale'];
                byteCode2.bytecode += web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address', 'bool'], [projectData.ETHRate, projectData.bonusRate, '0x14649976AEB09419343A54ea130b6a21Ec337772', tokenReceipt.contractAddress, projectData.bonusStatus]).slice(2)
                projectData.crowdsaleByteCode = byteCode2.bytecode;
                projectData.crowdsaleABICode = byteCode2.interface;
                projectData.crowdsaleContractCode = data;
                etherRopstenICOhandler.sendTransaction(accountData.address, byteCode2.bytecode, accountData.privateKey)
                  .then(async crowdsaleReceipt => {
                    projectData.crowdsaleContractHash = crowdsaleReceipt.transactionHash;
                    projectData.crowdsaleContractAddress = crowdsaleReceipt.contractAddress;
                    await projectData.save();
                    res.status(200).send({ tokenReceipt: tokenReceipt, crowdsaleReceipt: crowdsaleReceipt })
                  })
                  .catch(async e => {
                    console.error('error in 2st deployment', e)
                    projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                    projectData.tokenContractAddress = "Network error occured!  Please try again";
                    await projectData.save();
                    // res.status(400).send({ status: false, message: "Network error occured! Please try again" })
                  })
              })
            })
            .catch(async e => 
                {
                    projectData.crowdsaleContractAddress = "Network error occured! Please try again";
                    projectData.tokenContractAddress = "Network error occured!  Please try again";
                    await projectData.save();
                }
                // res.status(400).send({ status: false, message: "Network error occured! Please try again" })
            );
        console.log("listener function ends here");
        return;
        }
    }
}

var OAuthClient = require('intuit-oauth');
const IPFS = require('ipfs-http-client');
const fs = require('fs');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;


const ipfs = new IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  })
  
  require('dotenv').config();

  module.exports ={

    quickbooklogin:(req, res, next)=> {
       try{
        console.log("env",process.env);
        console.log("env1",configAuth.quickbook.clientId);
        oauthClient = new OAuthClient({
            clientId : configAuth.quickbook.clientId,
            clientSecret : configAuth.quickbook.clientSecret,
            environment : configAuth.quickbook.environment,
            redirectUri : configAuth.quickbook.redirectUri,
        });
        var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
        // return res.send({status : true, authUrl : authUri});
        res.status(200).send({ status: true, login_url:authUri});
        //
       }
       catch(e){
           console.log(e);
        res.status(400).send({ status: false, message: "no project found" })
       } 
      },

    callback:async (req,res)=>{
        // console.log(res)
        var parseRedirect = req.url;
        // var clientdata = await client.find({
        //     where: {
        //       'email': 'mansi@xinfin.org'
        //     }
        //   });

        //   clientdata.quickbook_url = parseRedirect;
        //   await clientdata.save();
          oauthClient.createToken(parseRedirect)
          .then(function(authResponse) {
              console.log("Token::",oauthClient.token.getToken());
              oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
              res.status(301).redirect("http://localhost/DemoTradeFinex/publicv/quickbook_dashboard");
    
          })
          .catch(function(e) {
              console.error("The error message is :"+e);
              console.error(e.intuit_tid);
          });
          

// //  Exchange the auth code retrieved from the **req.url** on the redirectUri
//     oauthClient.createToken(parseRedirect)
//     .then(function(authResponse) {
//         console.log("Token::",oauthClient.getToken().getToken);
//         // console.log('The Token is  '+ JSON.stringify(authResponse.getJson()));
//         oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
        
//         // res.status(200).send({ status: true, message:"successfully logged in with quickbook"});
        
//     })
//     .catch(function(e) {
//         res.status(404).send({ status: false, message: "please try again" })
        
//     });
    },
    //quickbook accesstoken valid or not 
    accessTokenValidity:(req,res)=>{

        if(oauthClient.isAccessTokenValid()) {
            console.log("The access_token is valid");
            res.send({status:true,message:"Succesfully logged in"});
        }
        else{
            res.send({status:false,message:"Failed"});
        } 
    },
      

    //quickbook dashboard
    dashboard:(req,res)=>{
        // parseRedirect = req.user.quickbook_url
        // console.log("url",parseRedirect)
        var companyID = oauthClient.getToken().realmId;
        console.log(companyID);

        lastUpdate = '2010-01-01';
        var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
        oauthClient.makeApiCall({url:url + 'v3/company/' + companyID +'/cdc?entities=Invoice, Customer&changedSince=' + lastUpdate})
        .then(function(authResponse){
            // console.log("The response for API call is :"+JSON.stringify(authResponse));
          //   res.send(JSON.parse(authResponse.text()));
          data = JSON.parse(authResponse.text());
          dashboardData = data.CDCResponse[0].QueryResponse[0].Invoice;
          // console.log(dashboardData);
            res.send({data:dashboardData});
            
            // res,render('',{invoices:JSON.parse(authResponse.text())});
        })
        .catch(function(e) {
            console.error("Error make api call",e);
        });
    },

    //quickbook upload invoice
    uploadInvoice:(req,res)=>{
        try{
            console.log(req.file);
            ipfs.add(req.file, (err, ipfsHash) => {
       
                         console.log(ipfsHash[0].hash);
                         objData.ipfsHash = ipfsHash[0].hash
                         res.status(200).send({status:true,hash:ipfsHash[0].hash})
            });
    //         console.log("file",req.body.myFile);
    //     console.log("inside erc721 contract 3");
    //     req.pipe(req.busboy);
    //     req.busboy.on('file', function (fieldname, file, filename) {
    //        console.log("Uploading: " + filename); 
         
   
    //        ipfs.add(file, (err, ipfsHash) => {
       
    //          console.log(ipfsHash[0].hash);
    //          objData.ipfsHash = ipfsHash[0].hash
    //          res.status(200).send({status:true,hash:ipfsHash[0].hash})
    //    });
    //  });

        }catch(e){
            console.log(e);
        }
        

    }
    
  }
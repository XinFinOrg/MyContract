var OAuthClient = require('intuit-oauth');
const IPFS = require('ipfs-http-client');
const fs = require('fs');
const multer = require('multer');



const ipfs = new IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  })
  
  require('dotenv').config();
  var router = express.Router();

  module.exports ={

    quickbooklogin:(req, res, next)=> {
       try{
        oauthClient = new OAuthClient({
            clientId : process.env.clientId,
            clientSecret : process.env.clientSecret,
            environment : process.env.environment,
            redirectUri : process.env.redirectUri
        });
        var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
        // return res.send({status : true, authUrl : authUri});
        res.status(200).send({ status: true, login_url:authUri});
       }
       catch{
        res.status(400).send({ status: false, message: "no project found" })
       } 
      },

    callback:(req,res)=>{
        var parseRedirect = req.url;

//  Exchange the auth code retrieved from the **req.url** on the redirectUri
    oauthClient.createToken(parseRedirect)
    .then(function(authResponse) {
        console.log("Token::",oauthClient.getToken().getToken);
        // console.log('The Token is  '+ JSON.stringify(authResponse.getJson()));
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
        
        res.status(200).send({ status: true, message:"successfully logged in with quickbook"});
    })
    .catch(function(e) {
        res.status(404).send({ status: false, message: "please try again" })
        
    });
    },
    
    //quickbook dashboard
    dashboard:(req,res)=>{
        var companyID = oauthClient.getToken().realmId;
        // console.log(oauthClient.environment,req.url);
        
        lastUpdate = '2010-01-01';
        var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
        oauthClient.makeApiCall({url:url + 'v3/company/' + companyID +'/cdc?entities=Invoice, Customer&changedSince=' + lastUpdate})
        .then(function(authResponse){
            // console.log("The response for API call is :"+JSON.stringify(authResponse));
          //   res.send(JSON.parse(authResponse.text()));
          data = JSON.parse(authResponse.text());
          dashboardData = data.CDCResponse[0].QueryResponse[0].Invoice;
          console.log(dashboardData);
          res.status(200).send({ status: true, data:dashboardData});
            
            // res,render('',{invoices:JSON.parse(authResponse.text())});
        })
        .catch(function(e) {
            console.error("Error make api call",e);
            res.status(400).send({ status: false, message: "server Error" })
        });
    },

    //quickbook upload invoice
    uploadInvoice:(req,res)=>{


    }
    
  }
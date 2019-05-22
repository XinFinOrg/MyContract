var OAuthClient = require('intuit-oauth');
const IPFS = require('ipfs-http-client');
const fs = require('fs');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
const path = require('path');
var ejs = require('ejs');
var pdf = require('html-pdf');


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
              res.status(301).redirect("https://demo.tradefinex.org/publicv/quickbook_dashboard/");
    
          })
          .catch(function(e) {
              console.error("The error message is :"+e);
              console.error(e.intuit_tid);
          });
          
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

    //upload invoice to ipfs
    uploadQuickBookInvoice:(req,res)=>{
        try{
            var companyID = oauthClient.getToken().realmId;
  console.log(req.query.id);
  lastUpdate = '2010-01-01';
  var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
  oauthClient.makeApiCall({ url: url + 'v3/company/' + companyID + '/invoice/'+req.query.id})
    .then(function (authResponse) {
      data = JSON.parse(authResponse.text());
      console.log(data);
      dashboardData = data.Invoice;
      console.log(dashboardData.CustomerRef.name);
      let path1 = path.join(__dirname, '../');
      console.log(path1+'/views/invoice.ejs');
      ejs.renderFile(path1+'/views/invoice.ejs',{data:dashboardData}, function(err, result) {
        // render on success
        if (result) {
           html = result;
        //    console.log(html);
           var options = { filename: 'invoice_'+req.id+'.pdf', format: 'A3', orientation: 'portrait',type: "pdf" };
           pdf.create(result, options).toFile('./uploads/invoice_'+req.id+'.pdf', function(err, result) {
            if (err) return console.log(err);
            console.log(result.filename);
            let data = fs.readFileSync(result.filename);

            ipfs.add(data, (err, ipfsHash) => {

              console.log(ipfsHash);
              res.status(200).send({status:true,hash:ipfsHash[0].hash});
            });
            console.log(res); // { filename: '/app/businesscard.pdf' }
           })
        }
        // render or error
        else {
           res.end('An error occurred');
           console.log(err);
        }
    });
  })
        }
        catch(e){
            console.log(e);
            res.send({status:false,message:"Failed"});
        }
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
        

    },

    //quickbook invoice manual
    upload:(req,res)=>{
        try{
            let path1 = path.join(__dirname, '../');
  console.log(path1);
  let data = fs.readFileSync(path1 + '/uploads/invoice_1245.pdf');
  let buffer = Buffer.from(data);
  ipfs.add(data, (err, ipfsHash) => {

    console.log(ipfsHash[0].hash);
    res.status(200).send({status:true,hash:ipfsHash[0].hash});
        });
    }catch(e){
        console.log(e);
        res.status(200).send({status:false,hash:"Server Error"});
    }
    }
    
}
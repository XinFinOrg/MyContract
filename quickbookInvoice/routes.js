const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var projectConfiguration = db.projectConfiguration;

var OAuthClient = require('intuit-oauth');
const IPFS = require('ipfs-http-client');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const ipfs = new IPFS({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https'
  })
 
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
var upload = multer({ dest: 'uploads/' })

var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
module.exports = function (app, express) {

    app.get('/v1/invoice/quickbook/login',isLoggedIn, impl.quickbooklogin);
    app.get('/v1/invoice/quickbook/callback', impl.callback);
    app.get('/v1/invoice/quickbook/dashboard', isLoggedIn, impl.dashboard);
    app.get('/v1/invoice/quickbook/logincheck', isLoggedIn, impl.accessTokenValidity);
    app.get('/v1/invoice/quickbook/upload', isLoggedIn, impl.upload);
    app.post('/v1/invoice/quickbook/uploadinvoice',upload.single('invoice'), (req, res) => {
        console.log(req, req.file, req.files);
        // console.log(req);
        
        // let data = fs.readFileSync(__dirname + '/private_account.pdf');
        // let buffer = Buffer.from(data);
        let path1 = path.join(__dirname,'../');
        console.log(path1);
        let data = fs.readFileSync( path1+ 'kycDump/'+req.files[0].filename);
          let buffer = Buffer.from(data);
        ipfs.add(data, (err, ipfsHash) => {
          
           console.log(ipfsHash[0].hash);
           res.status(200).send({status:true,hash:ipfsHash[0].hash});
      }); 
      
      });
}   

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // var token = req.cookies['clientToken'];
    // JWT enabled login strategy for end user
    jwt.verify(req.headers.authorization, configAuth.jwtAuthKey.secret, function (err, decoded) {
      if (err) {
        return res.send({ status: false, message: "please login again" })
      } else {
        client.find({
          where: {
            uniqueId: decoded.userId
          }
        }).then(user => {
          console.log("here 1")
          req.user = user;
          next();
        });
      }
    });
  
  }
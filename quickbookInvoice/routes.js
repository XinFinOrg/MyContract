const impl = require("./impl");
var db = require('../database/models/index');
var client = db.client;
var projectConfiguration = db.projectConfiguration;

const multer = require('multer');

 
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

    app.get('/v1/invoice/quickbook/login', isLoggedIn, impl.quickbooklogin);
    app.get('/v1/invoice/quickbook/callback', isLoggedIn, impl.callback);
    app.get('/v1/invoice/quickbook/dashboard', isLoggedIn, impl.dashboard);
    app.post('/v1/invoice/quickbook/uploadInvoice',upload.single('invoice'), impl.uploadInvoice);
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
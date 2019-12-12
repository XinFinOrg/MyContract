var passport = require('passport');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;
// var fs = require('fs');
var path = require('path');
// var paymentListener = require('../packageCart/paymentListener');
var bcrypt = require('bcrypt-nodejs');
var mailer = require('../emailer/impl');
const ImageDataURI = require('image-data-uri');
const readChunk = require('read-chunk');
const fileType = require('file-type');
var fs = require('fs');
module.exports = {
    adminLogin: async (req, res) => {
        res.render('superAdminLogin', {
            message: req.flash('loginMessage')
        });
    },
    postadminLogin: async (req, res) => {

    
    },
    adminDashboard: async (req, res) => { },
}
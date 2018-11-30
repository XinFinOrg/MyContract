var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var client = db.client;
var User = db.user;
var ProjectConfiguration = db.projectConfiguration;

module.exports = {
    postLogin: (req, res) => {
        if (req.body.adminEmail == 'superAdminn@mycontract.co' && req.body.password == 'autocoinAdminn@mycontract.co') {
            try {
                const token = jwt.sign({
                    adminEmail: req.body.adminEmail,
                }, configAuth.jwtAuthKey.secret, {
                        expiresIn: configAuth.jwtAuthKey.tokenLife
                    });
                //Send back the token to the user
                res.cookie('clientToken', token, {
                    expire: 36000 + Date.now()
                });
                console.log(token, "token")
                return res.send(token) //res.redirect('/dashboard')
            } catch (error) {
                console.log(error)
                return res.json({
                    'token': "failure",
                    'message': error
                });
            }
        }
        else {
            const error = new Error('An Error occured')
            return res.json({
                'token': "failure",
                'message': info
            });
        }

    },

    getKycDataForUser:async(req, res) => {
        userdata = new Object();
        userdata = await client.findAll({
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ["usertype_id", "kycDoc3", "kycDocName3", "kycDoc2", "kycDocName2", "kycDoc1", "kycDocName1", "password"]
            },
            raw: true
        })
        // userdata.forEach(element => {
        //     element.dataValues.link = "<a href='/icoDashboardSetup/project/" + req.params.projectName + "/kyctab/" + element.dataValues.uniqueId + "/getUserData'>click Here</a>"
        // });
        res.send({
            data: userdata
        });
    }
}
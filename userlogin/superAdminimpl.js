var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');

module.exports = {
    postLogin: (req, res, ) => {
        if (req.body.adminEmail == 'superAdminn@mycontract.co' && req.body.password == 'autocoinAdminn@mycontract.co') {
            try {
                const token = jwt.sign({
                    adminEmail: req.body.adminEmail,
                }, configAuth.jwtAuthKey.secret, {
                        expiresIn: configAuth.jwtAuthKey.tokenLife
                    });
                //Send back the token to the user
                res.cookie('UserToken', token, {
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

    }
}
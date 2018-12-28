var jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
var db = require('../database/models/index');
var admin = db.admin;
var client = db.client;
var User = db.user;
var ProjectConfiguration = db.projectConfiguration;
var passport = require('passport');
const ImageDataURI = require('image-data-uri');
const readChunk = require('read-chunk');
const fileType = require('file-type');
var icoListener = require('../icoHandler/listener');


module.exports = {
    postLogin: (req, res, next) => {
        console.log(req.body)
        passport.authenticate('admin-login', {
            session: false,
        }, async (err, user, info) => {
            console.log("Info" + info);
            try {
                if (err || !user || info) {
                    const error = new Error('An Error occured')
                    return res.json({
                        'token': "failure",
                        'message': err ? null : info
                    });
                }
                const token = jwt.sign({
                    userId: user.uniqueId,
                }, configAuth.jwtAuthKey.secret, {
                        expiresIn: configAuth.jwtAuthKey.tokenLife
                    });
                //Send back the token to the user
                res.cookie('adminToken', token, {
                    expire: 360000 + Date.now()
                });
                console.log(token, "token")
                return res.send(token) //res.redirect('/dashboard')
            } catch (error) {
                return next(error);
            }
        })(req, res, next);
    },
    postSignup: async function (req, res, next) {
        passport.authenticate('admin-signup', {
            session: false,
        }, async (err, status, info) => {
            try {
                if (err) {
                    const error = new Error('An Error occured')
                    return res.json({
                        'token': "failure",
                        'message': info
                    });
                }
                else if (info) {
                    res.send({ status: true, info })
                }
                else {
                    return res.send({ status: true, message: "signup successful" })
                }
            }
            catch (error) {
                return next(error);
            }

        })(req, res, next);
    },
    adminKYCupload: async (req, res, next) => {
        try {
            let buffer1 = readChunk.sync((req.files[0].path), 0, 4100);
            let buffer2 = readChunk.sync((req.files[1].path), 0, 4100);
            let buffer3 = readChunk.sync((req.files[2].path), 0, 4100);
            if (fileType(buffer1).mime == "image/jpeg" && fileType(buffer2).mime == 'image/jpeg' && fileType(buffer3).mime == 'image/jpeg') {
                admin.update({
                    "name": req.body.firstName + " " + req.body.lastName,
                    "isd_code": req.body.ISDCode,
                    "mobile": req.body.contactNumber,
                    'kycDoc1': await ImageDataURI.encodeFromFile(req.files[0].path),
                    'kycDoc2': await ImageDataURI.encodeFromFile(req.files[1].path),
                    'kycDoc3': await ImageDataURI.encodeFromFile(req.files[2].path),
                    "kycDocName1": req.body.kycDocName1,
                    "kycDocName2": req.body.kycDocName2,
                    "kycDocName3": req.body.kycDocName3,
                    "kyc_verified": "pending"
                }, {
                        where: {
                            'email': req.body.email
                        }
                    }).then(() => {
                        res.send({ status: true, message: "KYC submitted successfully" });
                    });
            } else {
                res.send({ status: false, message: "Error occured while uploading! Please check your image extension! only jpeg allowed" })
            }
        }
        catch{
            res.send({ status: false, message: "Error occured while uploading! Please check your image extension! only jpeg allowed" })
        }
    },

    adminBalance: async (req, res) => {
        try {
            var eth_address;
            var eth_addresses = await req.user.getUserCurrencyAddresses({
                where: {
                    currencyType: 'masterEthereum'
                }
            });
            eth_address = eth_addresses[0].address;
            Promise.all([icoListener.checkEtherBalance(eth_address), icoListener.checkTokenBalance(eth_address, '0xc573c48ad1037dd92cb39281e5f55dcb5e033a70')]).then(([ethBalance, tokenBalance]) => {
                res.send({
                    'ETHBalance': ethBalance,
                    'tokenBalance': tokenBalance
                });
            });
        } catch{
            res.send({
                status: false, message: "error occured while fetching balance",
            });
        }
    },

    getClientKYCData: async (req, res) => {
        userdata = new Object();
        userdata = await client.findAll({
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ["password", "google_id", "github_id"]
            },
            raw: true
        })
        // userdata.forEach(element => {
        //     element.dataValues.link = "<a href='/icoDashboardSetup/project/" + req.params.projectName + "/kyctab/" + element.dataValues.uniqueId + "/getUserData'>click Here</a>"
        // });
        res.send(userdata);
    },

    updateClientKYC: async (req, res) => {
        try {
            var userdata = await client.find({
                where: {
                    "uniqueId": req.params.uid,
                    "admin_id": req.user.uniqueId
                },
            })
            userdata.kyc_verified = req.body.accountStatus;
            userdata.status = req.body.kycStatus;
            userdata.save().then(() => {
                res.send({ status: true, message: "data updated" })
            }).catch(function (err) {
                res.send({ status: false, message: "error occured" })
            });
        } catch{
            res.send({ status: false, message: "error occured" })

        }
    },

    Adminlogout: async (req, res) => {
        res.clearCookie('clientToken');
        res.send({ status: true, message: "successfully signout" })
    }

    // makePayment: async (req, res, next) => {
    //     if (!req.body.otpValue) {
    //         admin.find({
    //             where: {
    //                 'email': req.user.email
    //             }
    //         }).then(admin => {
    //             admin.update({
    //                 paymentOTP: Math.floor(Math.random() * 9999) + 1
    //             }).then(async result => {
    //                 await otpMailer.sendConfirmationOTP(req.user.email, result.dataValues.paymentOTP)
    //                 res.send({ message: "OTP send for confirmation", status: true, otp: result.dataValues.paymentOTP });
    //             })
    //         });
    //     } else {
    //         admin.find({
    //             where: {
    //                 'email': req.user.email
    //             }
    //         }).then(result => {
    //             if (result.dataValues.paymentOTP == req.body.otpValue) {
    //                 Address.find({
    //                     where: {
    //                         'admin_id': req.user.uniqueId
    //                     }
    //                 }).then(address => {
    //                     admin.update({
    //                         paymentOTP: null,
    //                     },
    //                         {
    //                             where: {
    //                                 'uniqueId': req.user.uniqueId
    //                             }
    //                         }
    //                     ).then(async result => {
    //                         Promise.all([paymentListener.checkBalance(address.address)]).then(([balance]) => {
    //                             console.log(balance);
    //                             if (balance >= 1200000) {
    //                                 var receipt = paymentListener.sendToParent(address.address, address.privateKey);
    //                                 paymentListener.attachListener(address.address);
    //                                 res.send({ message: 'Successfully initiated payment. You will be shortly alloted package credits', status: true, receipt: receipt });
    //                             } else {
    //                                 res.send({ message: 'Insufficient funds to buy Package', status: false });
    //                             }
    //                             // res.redirect('/dashboard');
    //                         });
    //                     })
    //                 })
    //             }
    //             else {
    //                 // console.log(false)
    //                 res.send({ message: 'Please check your OTP', status: false });
    //             }
    //         })
    //     }
    // }
}
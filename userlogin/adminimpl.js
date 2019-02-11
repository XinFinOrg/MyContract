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
var fs = require('fs');
var otpMailer = require("../emailer/impl");
var Address = db.userCurrencyAddress;
var paymentListener = require('../packageCart/paymentListener');
var randomNumber = require("random-number")






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
                    return res.status(302).send({
                        'token': false,
                        'message': err ? null : info
                    });
                }
                const token = jwt.sign({
                    userId: user.uniqueId,
                }, configAuth.jwtAuthKey.secret, {
                        expiresIn: configAuth.jwtAuthKey.tokenLife
                    });
                //Send back the token to the user
                // res.cookie('adminToken', token, {
                //     expire: 360000 + Date.now()
                // });
                // console.log(token, "token")
                return res.status(200).send({ status: true, token: token })
            } catch (error) {
                return res.status(500).send({ status: false, message: "error" })
            }
        })(req, res, next);
    },

    makePayment: async function (req, res) {
        if (!req.body.otpValue) {
            admin.find({
                where: {
                    'email': req.user.email
                }
            }).then(admin => {
                let otp = randomNumber.generator({ min: 10000, max: 99999, integer: true });
                admin.update({
                    paymentOTP: otp,
                    otpStatus: true
                }).then(result => {
                    console.log(req.user.email, result.dataValues.paymentOTP);
                    otpMailer.sendConfirmationOTP(req.user.email, result.dataValues.paymentOTP)
                    res.send({ status: true, message: "OTP  sent to your respective email address." })
                })
            });
        } else {
            admin.find({
                where: {
                    'email': req.user.email
                }
            }).then(result => {
                result.otpStatus = false
                result.save();
                if (result.dataValues.paymentOTP == req.body.otpValue) {
                    Address.find({
                        where: {
                            'address': req.user.userCurrencyAddresses[0].address
                        }
                    }).then(address => {
                        Promise.all([paymentListener.checkBalance(address.address)]).then(([balance]) => {
                            if (balance >= 10000000) {
                                var receipt = paymentListener.sendToParent(address.address, address.privateKey, '10000000000000000000000000');
                                console.log(receipt)
                                paymentListener.attachAdminPackageListener(address.address);
                                res.send({ status: true, message: 'Successfully initiated payment. You will be shortly alloted package credits' });
                            } else {
                                res.send({ status: false, message: 'Insufficient funds to buy Package' });
                            }
                        });
                    })
                }
                else {
                    console.log(false)
                    res.send({ status: false });
                }
            })
        }
    },

    postSignup: async function (req, res, next) {
        passport.authenticate('admin-signup', {
            session: false,
        }, async (err, status, info) => {
            try {
                if (err) {
                    const error = new Error('An Error occured')
                    res.status(502);
                    return res.json({
                        'token': "failure",
                        'message': info
                    });
                }
                else {
                    if (status == false) {
                        res.status(409);
                        return res.send({ status: status, info })
                    } else {
                        res.status(200);
                        return res.send({ status: true, info: info })
                    }
                }
            }
            catch (error) {
                res.status(500);
                return res.json({
                    'status': "failure",
                    'message': "error"
                });
            }

        })(req, res, next);
    },
    adminKYCupload: async (req, res, next) => {
        // console.log("hrereer", req.body)
        try {
            let buffer1 = readChunk.sync((req.files[0].path), 0, 4100);
            let buffer2 = readChunk.sync((req.files[1].path), 0, 4100);
            let buffer3 = readChunk.sync((req.files[2].path), 0, 4100);
            let buffer4 = readChunk.sync((req.files[3].path), 0, 4100);
            if (fileType(buffer1).mime == "image/jpeg" && fileType(buffer2).mime == 'image/jpeg' && fileType(buffer3).mime == 'image/jpeg') {
                if (fileType(buffer4).mime == "image/png") {
                    admin.update({
                        "name": req.body.fullName,
                        "isd_code": req.body.ISDCode,
                        "mobile": req.body.contactNumber,
                        'kycDoc1': await ImageDataURI.encodeFromFile(req.files[0].path),
                        'kycDoc2': await ImageDataURI.encodeFromFile(req.files[1].path),
                        'kycDoc3': await ImageDataURI.encodeFromFile(req.files[2].path),
                        "kycDocName1": req.body.kycDocName1,
                        "kycDocName2": req.body.kycDocName2,
                        "kycDocName3": req.body.kycDocName3,
                        "companyName": req.body.companyName,
                        "companyLogo": await ImageDataURI.encodeFromFile(req.files[3].path),
                        "kyc_verified": "pending"
                    }, {
                            where: {
                                'email': req.user.email,
                                'uniqueId': req.user.uniqueId
                            }
                        }).then(() => {
                            req.files.forEach(element => {
                                fs.unlink(element.destination + '/' + element.originalname, function (error) {
                                    if (error) {
                                        throw error;
                                    }
                                    console.log('Deleted filename', element.originalname);
                                })
                            })
                            res.status(200).send({ status: true, message: "KYC submitted successfully" });
                        });
                } else {
                    res.status(409).send({ status: false, message: "Error occured while uploading! Please check your company logo image extension! only png allowed for site Logo" })
                }
            } else {
                res.status(409).send({ status: false, message: "Error occured while uploading! Please check your KYC document image extension! only jpeg allowed" })
            }
        }
        catch{
            res.status(409).send({ status: false, message: "Error occured while uploading! Please check your KYC document image extension! only jpeg allowed" })
        }
    },

    adminDetails: async (req, res) => {
        userdata = new Object();
        userdata.id = req.user.uniqueId
        userdata.name = req.user.name;
        userdata.email = req.user.email;
        userdata.contactNumber = req.user.isd_code + " - " + req.user.mobile;
        userdata.kyc_verified = req.user.kyc_verified;
        userdata.adminPackage = req.user.isAllowed;
        userdata.accountAddress = req.user.userCurrencyAddresses[0].address
        try {
            var eth_address;
            var eth_addresses = await req.user.getUserCurrencyAddresses({
                where: {
                    currencyType: 'masterEthereum'
                }
            });
            eth_address = eth_addresses[0].address;
            Promise.all([icoListener.checkEtherBalance(eth_address), icoListener.checkTokenBalance(eth_address, '0xc573c48ad1037dd92cb39281e5f55dcb5e033a70')]).then(([ethBalance, tokenBalance]) => {
                userdata.ETHBalance = ethBalance
                userdata.tokenBalance = tokenBalance
                res.status(200).send({ status: true, data: userdata })
            });
        } catch{
            res.status(302).send({
                status: false, message: "error occured while fetching data",
            });
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
                    'tokenBalance': tokenBalance,
                    status: true
                });
            });
        } catch{
            res.send({
                status: false, message: "error occured while fetching balance",
            });
        }
    },

    getClientList: async (req, res) => {
        try {
            userdata = new Object();
            userdata = await client.findAll({
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ["password", "google_id", "github_id"]
                },
                where: {
                    admin_id: req.user.uniqueId
                },
                raw: true
            })
            // userdata.forEach(element => {
            //     element.dataValues.link = "<a href='/icoDashboardSetup/project/" + req.params.projectName + "/kyctab/" + element.dataValues.uniqueId + "/getUserData'>click Here</a>"
            // });
            res.status(200).send({ status: true, clientData: userdata });
        } catch{
            res.status(302).send({ status: false, message: "error" })
        }
    },

    getClientKYCData: async (req, res) => {
        try {
            userdata = new Object();
            userdata = await client.find({
                attributes: {
                    exclude: ["password", "google_id", "github_id"]
                },
                where: {
                    admin_id: req.user.uniqueId,
                    uniqueId: req.params.clientId
                },
                raw: true
            })
            res.status(200).send({ status: true, clientData: userdata });
        } catch{
            res.status(302).send({ status: false, message: "error" })
        }
    },

    updateClientKYC: async (req, res) => {
        try {
            var userdata = await client.find({
                where: {
                    "uniqueId": req.params.clientId,
                    "admin_id": req.user.uniqueId
                },
            })
            userdata.kyc_verified = req.body.accountStatus;
            userdata.status = req.body.kycStatus;
            userdata.save().then(() => {
                res.status(200).send({ status: true, message: "data updated" })
            }).catch(function (err) {
                res.status(302).send({ status: false, message: "error occured" })
            });
        } catch{
            res.status(302).send({ status: false, message: "error occured" })

        }
    },

    verifyAdminAccount: (req, res) => {
        console.log(req.query)
        admin.find({
            where: {
                'email': req.query.email
            }
        }).then((client) => {
            client.status = true;
            client.save().then(res.redirect("/"));
        });
    },

    Adminlogout: async (req, res) => {
        jwt.sign({
            userId: req.user.uniqueId,
        }, configAuth.jwtAuthKey.secret, {
                expiresIn: configAuth.jwtAuthKey.logout
            });
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
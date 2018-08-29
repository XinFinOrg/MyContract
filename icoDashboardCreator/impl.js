var passport = require('passport');
var ICOSiteConfig = require('../database/models/index').ICOSiteConfig;
var User = require("../database/models/index").user;
const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');

module.exports = {
    //client setup
    icoDashboardSetup: function(req, res) {
      res.render('adminDashboard', {
        user: req.user
      });
    },
    getSiteConfiguration: function(req, res) {
      ICOSiteConfig.find({
        where: {
          'clientEmail': req.params.clientEmail
        }
      }).then(values => {
        res.send({
          data: values.dataValues,
          message: "updated!"
        })
      });
    },
    updateSiteConfiguration: function(req, res) {
      ICOSiteConfig.findOne({
        where: {
          "clientEmail": req.body.email
        }
      }).then(function(foundItem) {
        if (!foundItem) {
          console.log("inside 1");
          // Item not found, create a new one
          ICOSiteConfig.create({
              clientEmail: req.body.email,
              siteName: req.body.site_name,
              siteLogo: req.body.site_logo,
              contactMail: req.body.contact_mail,
              address: req.body.address,
              city: req.body.city,
              provience: req.body.provience,
              country: req.body.country,
              contactNo: req.body.contact_no,
              facebookUrl: req.body.facebook_url,
              twitterUrl: req.body.twitter_url,
              linkedInUrl: req.body.linkedin_url,
              websiteUrl: req.body.website_url,
              ethAddress: req.body.eth_address,
              btcAddress: req.body.btc_address,
            })
            .then(res.redirect("/icoDashboardSetup/client/" + req.body.email))
          // .catch(res.send({message:"updation error occured at Creation"}));
        } else {
          console.log("inside 2");
          // Found an item, update it
          ICOSiteConfig.update({
              siteName: req.body.site_name,
              siteLogo: req.body.site_logo,
              contactMail: req.body.contact_mail,
              address: req.body.address,
              city: req.body.city,
              provience: req.body.provience,
              country: req.body.country,
              contactNo: req.body.contact_no,
              facebookUrl: req.body.facebook_url,
              twitterUrl: req.body.twitter_url,
              linkedInUrl: req.body.linkedin_url,
              websiteUrl: req.body.website_url,
              ethAddress: req.body.eth_address,
              btcAddress: req.body.btc_address,
            }, {
              where: {
                "clientEmail": req.body.email
              }
            })
            .then(res.redirect("/icoDashboardSetup/client/" + req.body.email))
          // .catch(res.send({message:"updation error occured at updation"}));
          ;
        }
      })
      // .catch(res.send({message:"updation error occured at everything"}));
    },
    //user login
    userLogin: function(req, res) {
      res.render("userLogin.ejs");

      getUserSignup: function(req, res) {
          res.render("userSignup.ejs", {});
        },

        getUserLogin: function(req, res) {
          res.render("userLogin.ejs", {});
        },

        postUserLogin: async function(req, res, next) {
          passport.authenticate('user-login', {
            session: false
          }, async (err, user, info) => {
            console.log("This is :" + user);
            try {
              if (err || !user) {
                const error = new Error('An Error occured')
                return next(error);
              }
              req.login(user, {
                session: false
              }, async (error) => {
                if (error) return next(error)
                const token = jwt.sign({
                  user: user
                }, configAuth.jwtAuthKey.secret, {
                  expiresIn: configAuth.jwtAuthKey.tokenLife
                });
                //Send back the token to the user
                return res.json({
                  token
                });
              });
            } catch (error) {
              return next(error);
            }
          })(req, res, next);
        },

        postUserSignup: async function(req, res, next) {
          passport.authenticate('user-signup', {
            session: false
          }, async (err, user, info) => {
            console.log(user);
            try {
              if (err || !user) {
                const error = new Error('An Error occured')
                return next(error);
              }
              req.login(user, {
                session: false
              }, async (error) => {
                if (error) return next(error)
                const token = jwt.sign({
                  user: user
                }, configAuth.jwtAuthKey.secret, {
                  expiresIn: configAuth.jwtAuthKey.tokenLife
                });
                //Send back the token to the user
                return res.json({
                  token
                });
              });
            } catch (error) {
              return next(error);
            }
          })(req, res, next);
        }

    }

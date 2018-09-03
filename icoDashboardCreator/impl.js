var passport = require('passport');
var ICOSiteConfig = require('../database/models/index').ICOSiteConfig;
var User = require("../database/models/index").user;
const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
const ImageDataURI = require('image-data-uri');
var path = require('path');


module.exports = {
  //client setup
  icoDashboardSetup: function (req, res) {
    res.render('icoDashboard', {
      user: req.user
    });
  },

  siteConfiguration: function (req, res) {
    res.render('siteConfiguration', {
      user: req.user
    });
  },
  getSiteConfiguration: function (req, res) {
    console.log( req.params.clientEmail,"hello");
    ICOSiteConfig.find({
      where: {
        'clientEmail': req.params.clientEmail
      }
    }).then(values => {
      if (!values) {
        res.send({ message: "null!" });
      } else {
        res.send({
          data: values.dataValues,
          message: "updated!"
        })
      }
    });
  },
  updateSiteConfiguration: function (req, res) {
    console.log(req.file);
    ImageDataURI.encodeFromFile("kycdump/" + req.file.originalname)
      .then(imgurl => {
        ICOSiteConfig.findOne({
          where: {
            "clientEmail": req.body.email
          }
        }).then(function (foundItem) {
          if (!foundItem) {
            // Item not found, create a new one
            ICOSiteConfig.create({
              clientEmail: req.body.email,
              siteName: req.body.site_name,
              siteLogo: imgurl,
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
              .then(res.redirect("/siteConfiguration/client/" + req.body.email))
          } else {
            // Found an item, update it
            ICOSiteConfig.update({
              siteName: req.body.site_name,
              siteLogo: imgurl,
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
              .then(res.redirect("/siteConfiguration/client/" + req.body.email));
          }
        })
      })
  },
  //user login
  userLogin: function (req, res) {
    res.render("userLogin.ejs");
  },
  getUserSignup: function (req, res) {
    res.render("userSignup.ejs", {});
  },

  getUserLogin: function (req, res) {
    res.render("userLogin.ejs", {});
  },

  postUserLogin: async function (req, res, next) {
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
          res.cookie('token',token, {expire: 360000 + Date.now()});
          return res.json({
            'token': "success"
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  },

  postUserSignup: async function (req, res, next) {
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
          res.cookie('token',token, {expire: 1800000 + Date.now()});
          return res.json({
            "token": "success"
          });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

}

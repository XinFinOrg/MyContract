var passport = require('passport');
const jwt = require('jsonwebtoken');
var configAuth = require('../config/auth');
const ImageDataURI = require('image-data-uri');
var path = require('path');
var db = require('../database/models/index');
var client = db.client;
var ProjectConfiguration = db.projectConfiguration;


module.exports = {
  //client setup
  icoDashboardSetup: function (req, res) {
    console.log(req.params,"project")
    res.render('siteConfiguration', {
      user: req.user,
      projectName:req.params.projectName
    });
  },

  // siteConfiguration: function (req, res) {
  //   res.render('siteConfiguration', {
  //     user: req.user
  //   });
  // },
  getSiteConfiguration: function (req, res) {
    client.findAll({
      where: {
        'emailid': req.user.emailid,
      },
      include: [{
        model: ProjectConfiguration,
        where: {coinName:req.params.projectName }
      }],
    }).then(values => {
      if (!values) {
        res.send({ message: "null!" });
      } else {
        res.send({
          data: values[0].projectConfigurations[0].dataValues,
          message: "updated!"
        })
      }
    });
  },
  updateSiteConfiguration: function (req, res) {
    ImageDataURI.encodeFromFile("kycdump/" + req.file.originalname)
      .then(async imgurl => {
        var projectdata = await client.find({
          where: {
            'emailid': req.user.emailid
          },
          include: ['projectConfigurations'],
        })
        await ProjectConfiguration.update(
          {
            siteName: req.body.site_name,
            coinName: req.body.coin_name,
            softCap: req.body.soft_cap,
            hardCap: req.body.hard_cap,
            startDate: req.body.start_date,
            endDate: req.body.end_date,
            homeURL: req.body.website_url,
          },
          { where: { client_id: projectdata.projectConfigurations[0].dataValues.client_id } }).then(updatedata => {
            if (!updatedata)
              console.log("Project update failed !");
            console.log("Project updated successfully!");
            req.flash('contractMessage', 'Contract mined successfully!');
            res.redirect("/icoDashboardSetup/project/" +req.body.coin_name)
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
          res.cookie('token', token, { expire: 360000 + Date.now() });
          return res.json({
            token
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
          res.cookie('token', token, { expire: 1800000 + Date.now() });
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

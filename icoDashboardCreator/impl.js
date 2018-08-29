var passport = require('passport');
var ICOSiteConfig = require('../database/models/index').ICOSiteConfig;

module.exports = {
  //client setup
  icoDashboardSetup: function(req, res) {
    res.render('adminDashboard', {user: req.user});
  },
  getSiteConfiguration:function(req,res){
    ICOSiteConfig.find({
      where: {
        'clientEmail': req.params.clientEmail
      }
    }).then(values => {
      res.send({data:values.dataValues,message:"updated!"})
    });

  },
  updateSiteConfiguration:function(req,res){
    ICOSiteConfig.findOne({ where: {"clientEmail":req.body.email} }).then(function (foundItem) {
      if (!foundItem) {
        console.log("inside 1");
          // Item not found, create a new one
          ICOSiteConfig.create( {
            clientEmail:req.body.email,
            siteName: req.body.site_name,
            siteLogo:req.body.site_logo,
            contactMail:req.body.contact_mail,
            address:req.body.address,
            city:req.body.city,
            provience:req.body.provience,
            country:req.body.country,
            contactNo:req.body.contact_no,
            facebookUrl:req.body.facebook_url,
            twitterUrl:req.body.twitter_url,
            linkedInUrl:req.body.linkedin_url,
            websiteUrl:req.body.website_url,
            ethAddress:req.body.eth_address,
            btcAddress:req.body.btc_address,
          })
              .then(res.redirect("/icoDashboardSetup/client/"+req.body.email))
              // .catch(res.send({message:"updation error occured at Creation"}));
      } else {
        console.log("inside 2");
          // Found an item, update it
          ICOSiteConfig.update( {
            siteName: req.body.site_name,
            siteLogo:req.body.site_logo,
            contactMail:req.body.contact_mail,
            address:req.body.address,
            city:req.body.city,
            provience:req.body.provience,
            country:req.body.country,
            contactNo:req.body.contact_no,
            facebookUrl:req.body.facebook_url,
            twitterUrl:req.body.twitter_url,
            linkedInUrl:req.body.linkedin_url,
            websiteUrl:req.body.website_url,
            ethAddress:req.body.eth_address,
            btcAddress:req.body.btc_address,
          },{where: {"clientEmail":req.body.email}})
              .then(res.redirect("/icoDashboardSetup/client/"+req.body.email))
              // .catch(res.send({message:"updation error occured at updation"}));
          ;
      }
  })
  // .catch(res.send({message:"updation error occured at everything"}));
  },
//user login
  userLogin: function(req, res) {
    res.render("userLogin.ejs");
  },

  userSign: function(req, res) {
    res.render("userSignin.ejs");
  },

  registerUser: function(req, res) {
    const User = require("../database/models/index").user;
    // Table created
    User.sync({
      force: false
    }).then(() => {
      User.create({
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        email: req.body.email_id,
        country: req.body.country_id,
        password: req.body.password
      }).then(function(user) {
        console.log(user);
      }).then(() => {
        User.findOne().then(user => {
          console.log(user.get('lastName'));
        });
      });
    });
  },

  registerUserJWT: function(req, res, next) {
    passport.authenticate('user-jwt-login', {
      session: false
    }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, {
        session: false
      }, (err) => {
        if (err) {
          res.send(err);
        }
        // generate a signed son web token with the contents of user object and return it in the response
        const token = jwt.sign(user, 'your_jwt_secret');
        return res.json({
          user,
          token
        });
      });
    })(req, res);
  }
}

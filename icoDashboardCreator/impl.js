var passport = require('passport');
module.exports = {
  icoDashboardSetup: function(req, res) {

    res.send("ICO dashboard setup coming soon !!");

  },

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

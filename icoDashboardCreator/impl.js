module.exports = {
  icoDashboardSetup: function(req, res) {

    res.send("ICO dashboard setup coming soon !!");

  },

  userLogin: function(req, res) {
    res.render("userLogin.ejs");
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
  }
}

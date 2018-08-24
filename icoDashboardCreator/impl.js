module.exports = {
  icoDashboardSetup: function(req, res){

    res.send("ICO dashboard setup coming soon !!");

  },

  userLogin: function(req, res){
    res.render("userLogin.ejs");
  },

  registerUser: function(req, res) {
    const users = require("../database/models/index").user;
    // Table created
    users.create({
      firstName: 'John',
      lastName: 'Hancock'
    }).then(function(user) {
      console.log(user);
    }).then(() => {
      users.findOne().then(user => {
        console.log(user.get('lastName'));
      });
    });
  }
}

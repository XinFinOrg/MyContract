var passport = require('passport');

module.exports = {
    adminLogin: async (req, res) => {
        res.render('superAdminLogin', {
            message: req.flash('loginMessage')
        });
    },
    postadminLogin: async (req, res) => {
      
    },
    adminDashboard: async (req, res) => { },
}
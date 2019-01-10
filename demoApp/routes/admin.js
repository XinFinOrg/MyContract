var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET users listing. */
router.get('/login', function (req, res, next) {
    res.render('./adminView/adminLogin.ejs')
});

router.get('/dashboard', async function (req, res, next) {
    res.render('./adminView/adminDashboard.ejs')
});

router.get('/signUp', async function (req, res, next) {
    res.render('./adminView/adminSignup.ejs')
});

router.get('/', async function (req, res, next) {
    res.redirect('./login')
});
module.exports = router;

var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET users listing. */
router.get('/login', function (req, res, next) {
    res.render('./clientView/login.ejs')
});

router.get('/dashboard', async function (req, res, next) {
    res.render('./clientView/dashboard.ejs')
});

router.get('/signUp', async function (req, res, next) {
    res.render('./clientView/signup.ejs')
});

router.get('/', async function (req, res, next) {
    res.redirect('./login')
});

router.get('/erc223', async function (req, res, next) {
    res.render('./clientView/ERC223ContractCreator')
});

router.get('/erc20', async function (req, res, next) {
    res.render('./clientView/ERC20ContractCreator')
}); 

router.get('/buyPackage', async function (req, res, next) {
    res.render('./clientView/payment.ejs')
}); 
module.exports = router;

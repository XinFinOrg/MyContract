const impl = require("./impl");

module.exports = function (app, express) {

    app.get('/v1/invoice/quickbook/login', isLoggedIn, impl.quickbooklogin);
    app.get('/v1/invoice/quickbook/callback', isLoggedIn, impl.callback);
    app.get('/v1/invoice/quickbook/dashboard', isLoggedIn, impl.dashboard);
    app.get('/v1/invoice/quickbook/uploadInvoice', isLoggedIn, impl.uploadInvoice);
}   
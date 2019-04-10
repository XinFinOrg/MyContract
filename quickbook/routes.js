const impl = require("./impl");

module.exports= function(app){

    app.get('/quickbooklogin',impl.quickBookLogin);
    app.get('/quickbook/callback',impl.callback);
    app.get('/quickbook/refreshAccessToken',impl.refreshAccessToken );
    app.get('/quickbook/makeapicall',impl.makeAPICall );
    app.get('/quickbook/ipfsadd',impl.addIPFSFile);
    app.get('/quickbook/pdf',impl.getQuickBookPdf);
}
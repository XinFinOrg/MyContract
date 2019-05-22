var OAuthClient = require('intuit-oauth');
const IPFS = require('ipfs-http-client');

const fileReaderPullStream = require('pull-file-reader');
const fs = require('fs');


const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https'
})

var oauthClient = null;
//quickbook configuration setup
module.exports =
{
     quickBookLogin:(req,res)=> {
        oauthClient = new OAuthClient({
            clientId : "Q0HfsP9G5GK7bmhTgVRaQB9c0S5CT30blk93a4QSTZy2Sbtfoc",
            clientSecret : "tT041hb4Je3EQemUZYa98LDHPEXXkvNbqqKJFQea",
            environment : "sandbox",
            redirectUri : "https://mycontract.co/quickbook/callback"
        });
        var authUri = oauthClient.authorizeUri({scope:[OAuthClient.scopes.Accounting],state:'intuit-test'});
        return res.send({status : true, authUrl : authUri});
    },

    callback: async (req,res)=>{
        
        
         // Parse the redirect URL for authCode and exchange them for tokens
    var parseRedirect = req.url;

// Exchange the auth code retrieved from the **req.url** on the redirectUri
    await oauthClient.createToken(parseRedirect)
    .then(function(authResponse) {
        console.log("Token::",oauthClient.getToken().getToken);
        // console.log('The Token is  '+ JSON.stringify(authResponse.getJson()));
        oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
        
        res.send(oauth2_token_json);
    })
    .catch(function(e) {
        console.error("The error message is :"+e);
        console.error(e.intuit_tid);
    });
        
    },

    //makeapicall 
    makeAPICall: (req,res)=> {
        var companyID = oauthClient.getToken().realmId;
        console.log(oauthClient.environment,req.url);
        
        lastUpdate = '2010-01-01';
        var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
        oauthClient.makeApiCall({url:url + 'v3/company/' + companyID +'/cdc?entities=Invoice, Customer&changedSince=' + lastUpdate})
        .then(function(authResponse){
            console.log("inside make api call")
            console.log("The response for API call is :"+JSON.stringify(authResponse));
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function(e) {
            console.error("Error make api call",e);
        });
    },

    //get pdf
    getQuickBookPdf:(req,res)=> 
    {
        var companyID = oauthClient.getToken().realmId;
        var url = oauthClient.environment == 'sandbox' ? OAuthClient.environment.sandbox : OAuthClient.environment.production;
        oauthClient.makeApiCall({url:url + 'v3/company/' + companyID +'/invoice/34/pdf'})
        .then(function(authResponse){
            console.log("inside make api call")
            console.log("The response for API call is :"+JSON.stringify(authResponse));
            res.send(JSON.parse(authResponse.text()));
        })
        .catch(function(e) {
            console.error("Error make api call",e);
        });

    },

    
    //refresh accesstoken
    refreshAccessToken: (req,res)=>{

        oauthClient.refresh()
            .then(function(authResponse){
                console.log('The Refresh Token is  '+ JSON.stringify(authResponse.getJson()));
                oauth2_token_json = JSON.stringify(authResponse.getJson(), null,2);
                res.send(oauth2_token_json);
            })
            .catch(function(e) {
                console.error(e);
            });
    },

    //adding pdf file to ipfs server 
    addIPFSFile: (req,res)=>{
        let data = fs.readFileSync(__dirname + '/private_account.pdf');
        let buffer = Buffer.from(data);
        
        ipfs.add(data, (err, ipfsHash) => {
            console.log(ipfsHash);
           
            res.send(ipfsHash);
          }); 
    },

}

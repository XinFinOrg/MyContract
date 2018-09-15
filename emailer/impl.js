const nodemailerAuth = require("../config/auth").nodemailerAuth;
var nodemailer = require('nodemailer');
var ejs = require("ejs");
var fs = require('fs');
var transporter = nodemailer.createTransport({
  host: 'mail002.dakghar.in',
  port: 587,
  auth: nodemailerAuth
});

module.exports = {
  sendContractEmail: function(email, result) {
    ejs.renderFile(__dirname + '/emailerTemplates/contractMailer.ejs', {
      email: email
    }, (err, data) => {
      var mailOptions = {
        from: "contract@autocoin.com",
        to: email,
        subject: "AutoCoin - Smart Contract generation",
        html: data,
        attachments: [{
          filename: "coin.sol",
          content: result,
          contentType: "text/plain"
        }]
      };
      triggerEmail(mailOptions);
    });
  },

  sendEmail: function(sendermail, recipientmail, subject, content) {
    var mailOptions = {
      from: sendermail,
      to: recipientmail,
      subject: subject,
      text: content
    };
    triggerEmail(mailOptions);
  },

  sendVerificationMail: function(req, recipientmail, name, userhash) {
    var link = "http://" + req.get('host') + "/verifyMail?verificationId=" + userhash;
    ejs.renderFile(__dirname + '/emailerTemplates/emailVerification.ejs', {
      name: name,
      link: link
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "emailverification@autocoin.com",
        to: recipientmail,
        subject: "Email Verification",
        html: data
      };
      triggerEmail(mailOptions);
    });
  }
}

function triggerEmail(mailOptions) {
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return;
    }
  });
}

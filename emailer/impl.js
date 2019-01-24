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
  sendContractEmail: function (email, result) {
    ejs.renderFile(__dirname + '/emailerTemplates/contractMailer.ejs', {
      email: email
    }, (err, data) => {
      var mailOptions = {
        from: "contract@mycontract.co",
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

  sendEmail: function (sendermail, recipientmail, subject, content) {
    var mailOptions = {
      from: sendermail,
      to: recipientmail,
      subject: subject,
      text: content
    };
    triggerEmail(mailOptions);
  },

  sendVerificationMail: function (req, recipientmail, name, userhash) {
    // var link = "http://" + req.get('host') + "/verifyAccount?resetId=" + userhash + "&email=" + recipientmail;
    var link = "http://api.mycontract.co:3001/verifyAccount?resetId=" + userhash + "&email=" + recipientmail;
    ejs.renderFile(__dirname + '/emailerTemplates/emailVerification.ejs', {
      name: name,
      link: link
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "emailverification@mycontract.co",
        to: recipientmail,
        subject: "Email Verification",
        html: data
      };
      triggerEmail(mailOptions);
    });
  },

  sendAdminVerificationMail: function (req, recipientmail, name, userhash) {
    var link = "http://" + req.get('host') + "/verifyAdminAccount?resetId=" + userhash + "&email=" + recipientmail;
    ejs.renderFile(__dirname + '/emailerTemplates/emailVerification.ejs', {
      name: name,
      link: link
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "emailverification@mycontract.co",
        to: recipientmail,
        subject: "Email Verification",
        html: data
      };
      triggerEmail(mailOptions);
    });
  },

  sendUserVerificationMail: function (req, recipientmail, name, userhash) {
    var link = "http://" + req.get('host') + "/verifyMail?verificationId=" + userhash;
    ejs.renderFile(__dirname + '/emailerTemplates/emailVerification.ejs', {
      name: name,
      link: link
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "emailverification@mycontract.co",
        to: recipientmail,
        subject: "Email Verification",
        html: data
      };
      triggerEmail(mailOptions);
    });
  },
  //OTP
  sendConfirmationOTP: function (recipientmail, otp) {
    ejs.renderFile(__dirname + '/emailerTemplates/packageOTPMailer.ejs', {
      otp: otp
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "packagePayment@mycontract.co",
        to: recipientmail,
        subject: "Package Payment OTP",
        html: data
      };
      triggerEmail(mailOptions);
    });
  },
  //forgot password mailer
  forgotPasswordMailer: function (req, recipientmail, userhash) {
    var link = "http://" + req.get('host') + "/resetPassword?resetId=" + userhash + "&email=" + recipientmail;
    ejs.renderFile(__dirname + '/emailerTemplates/forgotPassword.ejs', {
      link: link
    }, (err, data) => {
      console.log(err);
      var mailOptions = {
        from: "forgotPassword@mycontract.co",
        to: recipientmail,
        subject: "Reset Password link",
        html: data
      };
      triggerEmail(mailOptions);
    });
  },

}

function triggerEmail(mailOptions) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return;
    }
  });
}

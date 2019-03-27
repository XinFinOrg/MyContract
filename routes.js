module.exports = function (app) {
  app.get('/', isLoggedIn, function (req, res) {
    req.toastr.info('Welcome to MyContract.',null,{"closeButton": true,"debug": false,
    "newestOnTop": false,"progressBar": false,"positionClass": "toast-top-right","preventDuplicates": false,"onclick": null,"showDuration": "300","hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"});
    res.render('landingPage',{req:req});
  });
  app.get('/privacyPolicy', function (req, res) { 

    res.render('privacyPolicy');
  });
  app.get('/termsConditions', function (req, res) {

    res.render('termsConditions');
  });
  app.get('/faqs', function (req, res) {
    res.render('faqs')
  });
  app.get('/downloadFAQs', function (req, res) {
    var file = __dirname + '/public/MC-FAQs.pdf';
    res.download(file);
  })
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    res.redirect('/dashboard');
  next();

  // if they aren't redirect them to the home page

}

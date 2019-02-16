const impl = require('./impl');
module.exports = function (app) {

  app.get('/buyPackage', isLoggedIn, impl.buyPackage);
  app.get('/payment', isLoggedIn, impl.payment);
  app.get('/buyToken', isLoggedIn, impl.buyToken);
  app.get('/getBalances', isLoggedIn, impl.getBalances);
  app.post('/api/getPaymentToken', isLoggedIn, impl.getPaymentToken);
  app.post('/api/sendPaymentInfo', isLoggedIn, impl.sendPaymentInfo);
  app.get('/paypal', impl.getPaypalPayment)
  app.post('/paypal', impl.postPaypalPayment)
  app.get('/paypal/process', impl.paymentProcess)
  app.get('/paypal/direct',isLoggedIn, impl.getPaypalDirect)
  app.get('/paypal/direct/process',isLoggedIn, impl.processPaypalDirect)
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');

}

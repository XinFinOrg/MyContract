const impl = require('./impl');
module.exports = function(app) {

  app.get('/buyPackage', impl.buyPackage);
  app.get('/payment', impl.payment);

}

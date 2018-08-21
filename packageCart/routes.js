var impl = require('./impl');
module.exports = function(app) {

  app.get('/buyPackage', impl.buyPackage);

}

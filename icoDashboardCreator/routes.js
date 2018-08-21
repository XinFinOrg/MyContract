const impl = require("./impl");

module.exports = function(app) {
  app.get('/icoDashboardSetup', impl.icoDashboardSetup);
}

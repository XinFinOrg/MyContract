const service = require("./impl");

module.exports = function(app){



    app.get('/customContract', function(req, res) {
        res.render('customContract');
      });

      app.get('/recommendedContract', function(req, res) {
        res.render('recommendedContract');
      });

      app.post("/api/createContract",service.createContract);

}

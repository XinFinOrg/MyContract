// const service = require("./impl");
var path = require('path');

module.exports = function(app,express){



    // app.get('/deployer', function(req, res) {
    //     res.render('');
    //   });

    app.use(express.static(path.join(__dirname, './dist')));

    app.get('/deployer', function (req, res) {
    res.sendFile(path.join(__dirname, './','dist', 'index.html'));
});


}

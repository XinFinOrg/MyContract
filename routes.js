module.exports = function(app){
  app.get('/', function(req, res) {
    res.statusCode = 302;
    res.setHeader("Location", "https://apidocs.mycontract.co/");
    res.end();
    // res.send({ message: 'Welcome to Mycontract for apis please find below document' });
  });
};

// // route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {

//   // if user is authenticated in the session, carry on
//   if (req.isAuthenticated())
//     res.redirect('/dashboard');
//   next();

//   // if they aren't redirect them to the home page

// }

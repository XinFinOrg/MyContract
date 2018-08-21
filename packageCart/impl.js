module.exports = {
  buyPackage: function(req, res) {
   // res.send("Package Card Page");

    res.render('buyPackage');
  },

  payment: function(req, res) {
    // res.send("Package Card Page");
 
     res.render('payment');
   }
}

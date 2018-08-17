var fs = require('fs');
var path = require("path");
module.exports = {
  readContract: async function(path) {
    fs.readFile(path, "utf8", function(err, data) {
      if (err) {
        return console.log(err);
      }
    });
  }

}

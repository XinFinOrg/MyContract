var fs = require('fs');

module.exports = {
  readContract: function(path, callback) {
    fs.readFile(path, "utf8", callback);
  }

}

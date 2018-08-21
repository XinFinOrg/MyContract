var fs = require('fs');

module.exports = {
  readContract: function(path) {
    return fs.readFileSync(path, "utf8");
  }

}

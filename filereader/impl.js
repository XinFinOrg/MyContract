var fs = require('fs');
var ejs = require("ejs");
let Promise = require('bluebird');

module.exports = {
  readContract: function(path) {
    return fs.readFileSync(path, "utf8");
  },

  readEjsFile: (path) => {
    return new Promise(function(resolve, reject) {
      ejs.renderFile(path, {}, (err, data) => {
        if(err)
          reject(err);
        resolve(data);
      });
    });
  }

}

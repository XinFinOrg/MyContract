'use strict';
module.exports = (sequelize, DataTypes) => {
  const ICOSiteConfig = sequelize.define('ICOSiteConfig', {
    sitename: DataTypes.STRING
  }, {});
  ICOSiteConfig.associate = function(models) {
    // associations can be defined here
  };
  return ICOSiteConfig;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ICOSiteConfig = sequelize.define('ICOSiteConfig', {
    clientEmail:DataTypes.STRING,
    siteName: DataTypes.STRING,
    siteLogo:DataTypes.STRING,
    contactMail:DataTypes.STRING,
    address:DataTypes.STRING,
    city:DataTypes.STRING,
    provience:DataTypes.STRING,
    country:DataTypes.STRING,
    contactNo:DataTypes.STRING,
    //Social urls
    facebookUrl:DataTypes.STRING,
    twitterUrl:DataTypes.STRING,
    linkedInUrl:DataTypes.STRING,
    websiteUrl:DataTypes.STRING,
    //eth & btc Address
    ethAddress:DataTypes.STRING,
    btcAddress:DataTypes.STRING,

  }, {
    freezeTableName: true,
    timestamps: false,

  });
  ICOSiteConfig.associate = function(models) {
    // associations can be defined here
  };
  return ICOSiteConfig;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    uniqueId: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isd_code: DataTypes.STRING,
    mobile: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    kyc_verified: DataTypes.BOOLEAN
  }, {});
  Client.associate = function (models) {
    Client.hasMany(models.ClientPackage, {
      foreignKey: 'clientId'
    });
    Client.hasMany(models.UserCurrencyAddress, {
      foreignKey: 'client_id'
      // onDelete: 'CASCADE',
    });
    Client.hasMany(models.ICOSiteConfig,{
      foreignKey: 'client_id'
    });

  };
  return Client;
};


    // // //currencies relation  which is one to one
    // // Client.belongsTo(models.Currency,
    // //   {
    // //     foreignKey: 'currency_id',
    // //   });

    // // //user currencies address
    // // Client.belongsTo(models.CurrencyAddress,
    // //   {
    // //     foreignKey: 'user_currency_address_id',
    // //   });

    // Client.hasMany(models.ClientPackage,{
    //   foreignKey: 'client_id',
    //   as: 'packages',
    // });

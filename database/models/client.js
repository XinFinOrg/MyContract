// created by rahul (29/08/2018)
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uniqueId:
    {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email:
    {
      type: DataTypes.STRING,
      validate:
      {
        isEmail: true,    // checks for email format (foo@bar.com)
      },
      allowNull: false,
    },
    password:
    {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isd_code:
    {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobile:
    {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status:
    {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    kyc_verified:
    {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {});
  Client.associate = function (models) {
    // associations can be defined here
    Client.hasMany(models.User,
      {
        foreignKey: 'client_id',
      },
    );

    // //currencies relation  which is one to one
    // Client.belongsTo(models.Currency,
    //   {
    //     foreignKey: 'currency_id',
    //   });

    // //user currencies address
    // Client.belongsTo(models.CurrencyAddress,
    //   {
    //     foreignKey: 'user_currency_address_id',
    //   });

    Client.hasMany(models.ClientPackage,{
      foreignKey: 'client_id',
      as: 'packages',
    });

    Client.hasMany(models.ICOSiteConfig,{
      foreignKey: 'client_id'
    });

  };
  return Client;
};

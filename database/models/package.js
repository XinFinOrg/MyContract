'use strict';
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {

    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name:
    {
      type:DataTypes.STRING,
      allowNull:false,
    },
    btc_price:
    {
      type:DataTypes.FLOAT,
      allowNull:false,
    },
    eth_price:
    {
      type:DataTypes.FLOAT,
      allowNull:false,
    },
    status:
      {
        type:DataTypes.BOOLEAN,
        defaultValue:true,
      },

    createdAt:
    {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {});
  Package.associate = function(models)
  {
    // associations can be defined here
    Package.hasOne(models.ClientPackage,
      {
        foreignKey:'client_package_id',

      });
  };
  return Package;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const package = sequelize.define('package', {

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
  package.associate = function(models)
  {
    // associations can be defined here
    package.hasMany(models.client,
      {
        foreignKey:'package_id',
        allowNull:true,

      });
  };
  return package;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const icotransactions = sequelize.define('icotransactions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    type: 
    {
      type:DataTypes.STRING,
      allowNull: false,
    },
    amount:
    {
      type:DataTypes.FLOAT,
      allowNull:false,
    },
    crypto_address:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    icotransactions_hash:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    blockNumber:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW
    },

  }, {});
  icotransactions.associate = function(models){};
  return icotransactions;
};
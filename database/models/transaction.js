'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
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
    transaction_hash:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    blockNumber:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },

  }, {});
  transaction.associate = function(models) {
    // associations can be defined here
  };
  return transaction;
};
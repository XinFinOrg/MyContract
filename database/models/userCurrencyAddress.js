'use strict';
module.exports = (sequelize, DataTypes) => {
  const userCurrencyAddress = sequelize.define('userCurrencyAddress', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING
    },

    cipher: {
      type: DataTypes.STRING
    },
    balance: {
      type: DataTypes.FLOAT
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
  userCurrencyAddress.associate = function(models) 
  {
  };
  return userCurrencyAddress;
};

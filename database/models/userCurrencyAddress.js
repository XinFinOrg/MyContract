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
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {});
  userCurrencyAddress.associate = function (models) { };
  return userCurrencyAddress;
};

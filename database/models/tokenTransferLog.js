'use strict';
module.exports = (sequelize, DataTypes) => {
  const tokenTransferLog = sequelize.define('tokenTransferLog', {
    uniqueId: {
      allowNull:false,
      primaryKey: true,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },

    paymentMethod: {
      type:DataTypes.STRING,
      allowNull: false,
    },

    tokenAmount: {
      type:DataTypes.FLOAT,
      allowNull:false,
    },

    address: {
      type:DataTypes.STRING,
      allowNull:true,
    },

    transaction_hash: {
      type:DataTypes.STRING,
      allowNull:true,
    },
    tokenTransferStatus: {
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
  tokenTransferLog.associate = function(models){};
  return tokenTransferLog;
};

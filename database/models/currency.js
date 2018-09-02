'use strict';
module.exports = (sequelize, DataTypes) => {
  const currency = sequelize.define('currency', {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
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
  currency.associate = function(models) {
    currency.hasMany(models.userCurrencyAddress, {
      foreignKey: 'currency_id',
      sourceKey: 'name',
      allowNull: 'false',
      onDelete: 'CASCADE'
    })
  };
  return currency;
};

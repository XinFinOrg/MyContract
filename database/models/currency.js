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
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1
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
<<<<<<< HEAD
  currency.associate = function(models) 
  {
    currency.hasMany(models.userCurrencyAddress,
      {
        foreignKey:'currency_id',
        sourceKey:'name',
        allowNull:'false',
        onDelete:'CASCDE'
      })
=======
  Currency.associate = function(models) {
    // associations can be defined here
    Currency.hasMany(models.UserCurrencyAddress, {
      foreignKey: 'currency_id',
      allowNull: false,
      onDelete: 'CASCADE',
    });
>>>>>>> 9836cad0e6bec07dfc9e030583297226df0b0ca1
  };
  return currency;
};

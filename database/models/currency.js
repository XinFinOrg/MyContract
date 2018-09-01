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
      unique: true
    },
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
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
  currency.associate = function(models) 
  {
    currency.hasMany(models.userCurrencyAddress,
      {
        foreignKey:'currency_id',
        sourceKey:'name',
        allowNull:'false',
        onDelete:'CASCDE'
      })
  };
  return currency;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserCurrencyBalance = sequelize.define('UserCurrencyBalance', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    balance:{
      type: DataTypes.FLOAT
    },
    uniqueId:
    {
      allowNull:false,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
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
  UserCurrencyBalance.associate = function(models)
  {
    // associations can be defined here
    UserCurrencyBalance.belongsTo(models.Client,
      {
        foreignKey: 'client_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );

    UserCurrencyBalance.belongsTo(models.User,
      {
        foreignKey: 'user_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );
    UserCurrencyBalance.belongsTo(models.Currency,
      {
        foreignKey:'currency_id',
        allowNull:false,
        onDelete:'CASCADE',
      });
  };
  return UserCurrencyBalance;
};

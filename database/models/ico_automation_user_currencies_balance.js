'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_user_currencies_balance = sequelize.define('ico_automation_user_currencies_balance', {
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
  ico_automation_user_currencies_balance.associate = function(models)
  {
    // associations can be defined here
    ico_automation_user_currencies_balance.belongsTo(models.ico_automation_client,
      {
        foreignKey: 'client_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );

    ico_automation_user_currencies_balance.belongsTo(models.ico_automation_user,
      {
        foreignKey: 'user_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );
    ico_automation_user_currencies_balance.belongsTo(models.ico_automation_currencies,
      {
        foreignKey:'currency_id',
        allowNull:false,
        onDelete:'CASCADE',
      });
  };
  return ico_automation_user_currencies_balance;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_currencies = sequelize.define('ico_automation_currencies', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    name: {
    type:  DataTypes.STRING
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
  ico_automation_currencies.associate = function(models) {
    // associations can be defined here
    // associations can be defined here
    ico_automation_currencies.belongsTo(models.ico_automation_client,
      {
        foreignKey: 'client_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );
  };
  return ico_automation_currencies;
};

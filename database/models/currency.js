'use strict';
module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
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
  Currency.associate = function(models) {
    // associations can be defined here
    // associations can be defined here
    Currency.belongsTo(models.Client,
      {
        foreignKey: 'client_id',
        allowNull:true,
        onDelete: 'CASCADE',
      }
    );
  };
  return Currency;
};

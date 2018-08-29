'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_userType = sequelize.define('ico_automation_userType', {

      id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        uniqueId:
        {
          allowNull:false,
          type:DataTypes.UUID,
          defaultValue: DataTypes.UUIDV1,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
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
  ico_automation_userType.associate = function(models)
  {
    // associations can be defined here
  };
  return ico_automation_userType;
};

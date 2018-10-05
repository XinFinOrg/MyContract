'use strict';
module.exports = (sequelize, DataTypes) => {
  const userType = sequelize.define('userType', {

    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
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
  userType.associate = function(models) {
    // associations can be defined here
    userType.hasMany(models.user, {
      foreignKey: 'usertype_id',
      allowNull: false,
    });
  };
  return userType;
};

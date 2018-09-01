'use strict';
module.exports = (sequelize, DataTypes) => {
  const nodeConfiguration = sequelize.define('nodeConfiguration', {
    id: 
    {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    host: 
    {
      type:DataTypes.STRING
    },
    port:
    {
      type:DataTypes.INTEGER
    },
    username:
    {
      type:DataTypes.STRING,

    }, 
    password:
    {
      type: DataTypes.STRING,
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
  nodeConfiguration.associate = function(models) {
    // associations can be defined here
  };
  return nodeConfiguration;
};
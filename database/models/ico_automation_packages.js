'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_packages = sequelize.define('ico_automation_packages', {
    
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: 
    {
      type:DataTypes.STRING,
      allowNull:false,
    },
    btc_price:
    {
      type:DataType.Float,
      allowNull:false,
    },
    eth_price:
    {
      type:DataType.Float,
      allowNull:false,
    },
    status:
      {
        type:DataTypes.BOOLEAN,
        defaultValue:true,
      },

    createdAt: 
    {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {});
  ico_automation_packages.associate = function(models) 
  {
    // associations can be defined here
    ico_automation_packages.hasMany(models.ico_automation_client_packages,
      {
        foreignKey:'client_package_id',

      });
  };
  return ico_automation_packages;
};
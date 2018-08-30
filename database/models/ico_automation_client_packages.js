'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_client_packages = sequelize.define('ico_automation_client_packages', {
   
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    status:
      {
        type:DataTypes.BOOLEAN,
        defaultValue:true,
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
  ico_automation_client_packages.associate = function(models) 
  {
    // associations can be defined here
    ico_automation_client_packages.belongsTo(models.ico_automation_packages,
      {
        foreignKey:'package_id',
        allowNull:'false', 
      });
    
    //client   
    ico_automation_client_packages.belongsTo(models.ico_automation_client,
      {
        foreignKey:'client_id',
        allowNull:'false',
        onDelete:'CASCADE',          
      });  
  };
  return ico_automation_client_packages;
};
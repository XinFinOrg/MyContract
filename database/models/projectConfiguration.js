'use strict';
module.exports = (sequelize, DataTypes) => {
  const projectConfiguration = sequelize.define('projectConfiguration', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    host: {
      type:DataTypes.STRING
    },
    uniqueId:
    {
      allowNull:true,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    siteName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coinName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siteLogo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenSupply:
    {
      type: DataTypes.STRING,
      allowNull: true,
    },
    softCap:
    {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hardCap:
    {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate:
    {
      type:DataTypes.DATE,
      allowNull: true,
    },
    endDate:
    {
      type:DataTypes.DATE,
      allowNull: true,
    } ,
    homeURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aboutusURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    createdAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {});
  projectConfiguration.associate = function(models)
  {
<<<<<<< HEAD:database/models/projectConfiguration.js
    // associations can be defined here
    
    //currency define
    projectConfiguration.hasOne(models.currency,
      {
        foreignKey:project_id,
        allowNull:true,
      });
    
      projectConfiguration.hasMany(models.user,
        {
          foreignkey:project_id,
          allowNull:false,
          onDelete:'CASCADE'
        })
=======
    // // associations can be defined here
    // ICOSiteConfig.belongsTo(models.Client,
    //   {
    //     foreignKey: 'client_id', // add foreignKey to client
    //     onDelete: 'CASCADE',
    //   }
    // );
    ICOSiteConfig.hasMany(models.User, {
      foreignKey: 'project_id',
      allowNull: false,
      onDelete: 'CASCADE',
    });


>>>>>>> 9836cad0e6bec07dfc9e030583297226df0b0ca1:database/models/icoiteconfig.js
  };
  return projectConfiguration;
};

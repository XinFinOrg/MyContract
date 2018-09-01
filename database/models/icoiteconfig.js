'use strict';
module.exports = (sequelize, DataTypes) => {
  const ICOSiteConfig = sequelize.define('ICOSiteConfig', {
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
  ICOSiteConfig.associate = function(models)
  {
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


  };
  return ICOSiteConfig;
};

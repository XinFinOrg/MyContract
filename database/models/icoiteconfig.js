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
      allowNull:false,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    siteName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coinName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    siteLogo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tokenSupply:
    {
      type: DataTypes.STRING,
      allowNull: false,
    },
    softCap:
    {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hardCap:
    {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate:
    {
      type:DataTypes.DATE,
      allowNull: false,
    },
    endDate:
    {
      type:DataTypes.DATE,
      allowNull: false,
    } ,
    homeURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aboutusURL: {
      type: DataTypes.STRING,
      allowNull: false,
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
  ICOSiteConfig.associate = function(models)
  {
    // associations can be defined here
    ICOSiteConfig.belongsTo(models.Client,
      {
        foreignKey: 'client_id', // add foreignKey to client
        onDelete: 'CASCADE',
      }
    );


  };
  return ICOSiteConfig;
};

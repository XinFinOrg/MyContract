'use strict';
module.exports = (sequelize, DataTypes) => {
  const projectConfiguration = sequelize.define('projectConfiguration', {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    uniqueId:
    {
      allowNull: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    siteName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siteLogo: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    coinName: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true,
    },

    coinSymbol: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true,
    },

    tokenSold: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    tokenSupply: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    softCap: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hardCap: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    ethConversionRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    minimumContribution: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate:
    {
      type: DataTypes.DATE,
      allowNull: true,
    },
    homeURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aboutusURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contractCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contractByteCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contractHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {});
  projectConfiguration.associate = function (models) {
    // associations can be defined here

    //currency define
    projectConfiguration.hasOne(models.currency,
      {
        foreignKey: 'project_id',
        allowNull: true,
      });

    projectConfiguration.hasMany(models.user,
      {
        foreignKey: 'projectConfigurationCoinName',
        allowNull: false,
        onDelete: 'CASCADE'
      });
      projectConfiguration.hasMany(models.userCurrencyAddress, {
        foreignKey: 'project_id',
        onDelete: 'CASCADE',
      });

      projectConfiguration.hasMany(models.icotransactions, {
        foreignKey: 'project_id',
        allowNull: true,
        onDelete: 'CASCADE'
      });
  };
  return projectConfiguration;
};

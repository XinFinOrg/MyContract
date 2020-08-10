'use strict';
module.exports = (sequelize, DataTypes) => {
  const projectConfiguration = sequelize.define('projectConfiguration', {
    uniqueId: {
      allowNull: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    siteName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    siteLogo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    coinName: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: true,
    },

    coinSymbol: {
      type: DataTypes.STRING,
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

    minimumContribution: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    bonusRate: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    bonusStatus: {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    },
    isAllowedForICO: {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
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
    networkType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    networkURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenContractAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tokenContractCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenByteCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenABICode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenContractHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    crowdsaleContractAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    crowdsaleContractCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    crowdsaleByteCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    crowdsaleABICode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    crowdsaleContractHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ETHRate: {
      type: DataTypes.INTEGER,
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
    metadata:{
      type: DataTypes.TEXT
    }
  }, {});
  projectConfiguration.associate = function (models) {
    // associations can be defined here

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

    projectConfiguration.hasMany(models.tokenTransferLog, {
      foreignKey: 'project_id',
      allowNull: true,
      onDelete: 'CASCADE'
    });
  };
  return projectConfiguration;
};

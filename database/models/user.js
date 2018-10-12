'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      unique: true,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true, // checks for email format (foo@bar.com)
      },
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isd_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    kyc_verified:
    {
      type:DataTypes.ENUM,
      values: ['notInitiated','active', 'pending', 'rejected'],
      defaultValue:"notInitiated",
    },
    kycDocName1:
    {
      type:DataTypes.STRING,
    },
    kycDoc1:
    {
      type:DataTypes.STRING
    },
    kycDocName2:
    {
      type:DataTypes.STRING,
    },
    kycDoc2:
    {
      type:DataTypes.STRING
    },
    kycDocName3:
    {
      type:DataTypes.STRING,
    },
    kycDoc3:
    {
      type:DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    //
    user.hasMany(models.userCurrencyAddress, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    //transaction relation
    user.hasMany(models.tokenTransferLog, {
      foreignKey: 'user_id',
      allowNull: true,
    });

    user.belongsTo(models.projectConfiguration, {
      allowNull: false,
      foreignKey: 'projectConfigurationCoinName'
    });

  };
  return user;
};

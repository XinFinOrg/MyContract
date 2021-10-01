'use strict';
module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define('client', {
    uniqueId:{
      allowNull:false,
      primaryKey: true,
      type:DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email:
    {
      type:DataTypes.STRING,
      validate:
      {
        isEmail: true,    // checks for email format (foo@bar.com)
      },
      allowNull:false,
    },
    password:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    google_id:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    facebook_id:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    github_id:
    {
      type:DataTypes.STRING,
      allowNull:true,
    },
    isd_code:
    {
      type:DataTypes.INTEGER,
      allowNull:true,
    },
    mobile:
    {
      type:DataTypes.NUMERIC,
      allowNull:true,
    },
    status:
    {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    },
    attemptsCount:
    {
      type:DataTypes.INTEGER,
      defaultValue: 0
    },
    package1:
    {
      type:DataTypes.INTEGER,
      defaultValue: 0
    },
    package2:
    {
      type:DataTypes.INTEGER,
      defaultValue: 0
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
      type:DataTypes.STRING(10485760),
    },
    kycDocName2:
    {
      type:DataTypes.STRING,
    },
    kycDoc2:
    {
      type:DataTypes.STRING(10485760),
    },
    kycDocName3:
    {
      type:DataTypes.STRING,
    },
    kycDoc3:
    {
      type:DataTypes.STRING(10485760),
    },
    paymentOTP:
    {
      type:DataTypes.NUMERIC
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
  client.associate = function (models) {
    client.hasMany(models.projectConfiguration,
      {
      foreignKey: 'client_id',
      onDelete: 'CASCADE',
    });

    //currencyaddress
    client.hasMany(models.userCurrencyAddress,
      {
        foreignKey:'client_id',
        allowNull:true,
        onDelete:'CASCADE'
      });

  };
  return client;
};

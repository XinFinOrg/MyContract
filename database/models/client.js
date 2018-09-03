'use strict';
module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define('client', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uniqueId:
    {
      allowNull:false,
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
      allowNull:false,
    },
    isd_code:
    {
      type:DataTypes.INTEGER,
      allowNull:true,
    },
    mobile:
    {
      type:DataTypes.INTEGER,
      allowNull:true,
    },
    status:
    {
      type:DataTypes.BOOLEAN,
      defaultValue:true,
    },
    kyc_verified:
    {
      type:DataTypes.BOOLEAN,
      defaultValue:false,
    },
    kycDocName1:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    }, 
    kycDocUrl1:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    },
    kycDocName2:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    }, 
    kycDocUrl2:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    },
    kycDocName3:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    }, 
    kycDocUrl3:
    {
      type:DataTypes.STRING,
      defaultValue:true,
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
    // client.hasMany(models.user,
    //   {
    //   foreignKey: 'client_id',
    //   onDelete: 'CASCADE',
    // });
    client.hasMany(models.projectConfiguration,
      {
      foreignKey: 'client_id',
      onDelete: 'CASCADE',
    });

    //transaction
    client.hasMany(models.icotransactions,
      {
        foreignKey:'client_id',
        onDelete: 'CASCADE',
      });

    //currencyaddress
    client.hasMany(models.userCurrencyAddress,
      {
        foreignKey:'client_id',
        allowNull:true,
        onDelete:'CASCADE'
      })

  };
  return client;
};

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
    emailid:
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
  client.associate = function (models) {
    client.hasMany(models.user, 
      {
      foreignKey: 'client_id',
      onDelete: 'CASCADE',
    });
    client.hasMany(models.projectConfiguration,
      {
      foreignKey: 'client_id',
      onDelete: 'CASCADE',
    });

    //transaction
    client.hasMany(models.transaction,
      {
        foreignKey:'client_id',
        onDelete:'CASCADE',
      })

  };
  return client;
};


    // // //currencies relation  which is one to one
    // // client.belongsTo(models.Currency,
    // //   {
    // //     foreignKey: 'currency_id',
    // //   });

    // // //user currencies address
    // // client.belongsTo(models.CurrencyAddress,
    // //   {
    // //     foreignKey: 'user_currency_address_id',
    // //   });

    // client.hasMany(models.clientPackage,{
    //   foreignKey: 'client_id',
    //   as: 'packages',
    // });

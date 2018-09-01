'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: 
    {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
    },
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
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
    kyc_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  user.associate = function(models) {
    // associations can be defined here
    //
    user.hasMany(models.userCurrencyAddress, 
      {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });

    //transaction relation
    user.hasMany(models.transaction,
      {
        foreignKey:'transaction_id',
        allowNull:true,

      });


  };
  return user;
};

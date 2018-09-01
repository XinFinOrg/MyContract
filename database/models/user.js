'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    uniqueId: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      
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
      defaultValue:DataTypes.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue:DataTypes.NOW
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
<<<<<<< Updated upstream
    user.hasMany(models.icotransactions,
      {
        foreignKey:'user_id',
        allowNull:true,
=======
    user.hasMany(models.transaction, {
      foreignKey: 'transaction_id',
      allowNull: true,
>>>>>>> Stashed changes

    });


  };
  return user;
};

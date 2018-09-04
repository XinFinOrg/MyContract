'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: DataTypes.INTEGER
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
      primaryKey: true,
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
      defaultValue: false,
    },
    kycDocName1:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    },
    kycDoc1:
    {
      type:DataTypes.BLOB
    },
    kycDocName2:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    },
    kycDoc2:
    {
      type:DataTypes.BLOB
    },
    kycDocName3:
    {
      type:DataTypes.STRING,
      defaultValue:true,
    },
    kycDoc3:
    {
      type:DataTypes.BLOB
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
      sourceKey: 'email'
    });

    //transaction relation
    user.hasMany(models.icotransactions, {
      foreignKey: 'user_id',
      allowNull: true,
      sourceKey: 'email'
    });

    user.belongsTo(models.projectConfiguration, {
      allowNull: false,
      through: 'UserProject'
    });


  };
  return user;
};

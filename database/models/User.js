'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
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
      country:
      {
        type:DataTypes.INTEGER,
        allowNull:true,
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
  User.associate = function(models){
    // associations can be defined here
    // one to one relation with usertype
    User.belongsTo(models.UserType,
      {
        foreignKey: 'userType_id',//add foreignKey to user
        onDelete: 'CASCADE',
      }
    );

    User.belongsTo(models.Client,
      {
        foreignKey: 'client_id',
        onDelete: 'CASCADE',
      }
    );

    User.hasMany(models.userCurrencyAddress,
      {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      }
    );

  };
  return User;
};

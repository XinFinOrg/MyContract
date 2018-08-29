'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_user = sequelize.define('ico_automation_user', {
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
        allowNull: false,
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
  ico_automation_user.associate = function(models){
    // associations can be defined here
    // one to one relation with usertype
    ico_automation_user.belongsTo(models.ico_automation_userType,
      {
        foreignKey: 'userType_id',//add foreignKey to user
        onDelete: 'CASCADE',
      }
    );

    ico_automation_user.belongsTo(models.ico_automation_client,
      {
        foreignKey: 'client_id',
        onDelete: 'CASCADE',
      }
    );

  };
  return ico_automation_user;
};

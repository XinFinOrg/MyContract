// created by rahul (29/08/2018)
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ico_automation_client = sequelize.define('ico_automation_client', {
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
  ico_automation_client.associate = function(models)
  {
    // associations can be defined here
    ico_automation_client.hasMany(models.ico_automation_user,
    {
      foreignKey:'user_id',
    },
    );

     //currencies relation  which is one to one 
     ico_automation_client.belongsTo(models.ico_automation_currencies,
      {
        foreignKey:'currency_id',
      });

      //user currencies address
      ico_automation_client.belongsTo(models.ico_automation_user_currencies_address,
        {
          foreignKey:'user_currencies_address_id',
        });  
      
    // // associations can be defined here
    // ico_automation_client.belongsTo(models.ico_automation_client,
    // {

    //     foreignKey: 'client_id',
    //     allowNull:true,
    //     onDelete: 'CASCADE',
    // }
    // );  

  };
  return ico_automation_client;
};

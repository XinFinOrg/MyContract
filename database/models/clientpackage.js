'use strict';
module.exports = (sequelize, DataTypes) => {
  const ClientPackage = sequelize.define('ClientPackage', {

    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    status:
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
  ClientPackage.associate = function(models)
  {
    // // associations can be defined here
    // ClientPackage.belongsTo(models.Package,
    //   {
    //     foreignKey:'client_package_id',
    //     allowNull:'false',
    //   });

    // //client
    // ClientPackage.belongsTo(models.Client,
    //   {
    //     foreignKey:'client_id',
    //     allowNull:'false',
    //     onDelete:'CASCADE',
    //   });
  };
  return ClientPackage;
};

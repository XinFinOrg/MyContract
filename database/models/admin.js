'use strict';
module.exports = (sequelize, DataTypes) => {
    const admin = sequelize.define('admin', {
        uniqueId: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email:
        {
            type: DataTypes.STRING,
            validate:
            {
                isEmail: true,    // checks for email format (foo@bar.com)
            },
            allowNull: false,
        },
        password:
        {
            type: DataTypes.STRING,
            allowNull: true,
        },
        google_id:
        {
            type: DataTypes.STRING,
            allowNull: true,
        },
        github_id:
        {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isd_code:
        {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        mobile:
        {
            type: DataTypes.NUMERIC,
            allowNull: true,
        },
        status:
        {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        kyc_verified:
        {
            type: DataTypes.ENUM,
            values: ['notInitiated', 'active', 'pending', 'rejected'],
            defaultValue: "notInitiated",
        },
        kycDocName1:
        {
            type: DataTypes.STRING,
        },
        kycDoc1:
        {
            type: DataTypes.STRING(10485760),
        },
        kycDocName2:
        {
            type: DataTypes.STRING,
        },
        kycDoc2:
        {
            type:  DataTypes.STRING(10485760),
        },
        kycDocName3:
        {
            type: DataTypes.STRING,
        },
        kycDoc3:
        {
            type:  DataTypes.STRING(10485760),
        },
        paymentOTP:
        {
            type: DataTypes.NUMERIC,
            allowNull:true
        },
        isAllowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        companyName:
        {
            type: DataTypes.STRING,
        },
        companyLogo:
        {
            type:  DataTypes.STRING(10485760),
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
    admin.associate = function (models) {
        admin.hasMany(models.client,
            {
                foreignKey: 'admin_id',
                onDelete: 'CASCADE',
            });

        //currencyaddress
        admin.hasMany(models.userCurrencyAddress,
            {
                foreignKey: 'admin_id',
                allowNull: true,
                onDelete: 'CASCADE'
            });
    };
    return admin;
};
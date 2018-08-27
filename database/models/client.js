'use strict';
module.exports = (sequelize, Sequelize) => {
  const Client = sequelize.define('Client', {
    name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    ethereumAccount: {
      type: Sequelize.STRING
    },
    cipher: {
      type: Sequelize.STRING
    },
    balance: {
      type: Sequelize.NUMERIC
    },
    password: {
      type: Sequelize.STRING
    },
    github_id: {
      type: Sequelize.STRING
    },
    google_id: {
      type: Sequelize.STRING
    },
    contractAddress: {
      type: Sequelize.STRING
    },
    contractTxHash: {
      type: Sequelize.STRING
    },
    package1: {
      type: Sequelize.BOOLEAN
    },
    package2: {
      type: Sequelize.BOOLEAN
    },
    package3: {
      type: Sequelize.BOOLEAN
    },
    project: {
      type: Sequelize.STRING
    }
  }, {});
  Client.associate = function(models) {
    // associations can be defined here
  };
  return Client;
};

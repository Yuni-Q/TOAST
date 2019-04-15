// "use strict";
// const Sequelize = require('sequelize');

module.exports = (Sequelize, DataTypes) => {
  const notifications = Sequelize.define(
    'notifications', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: DataTypes.DATE,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
    }, {},
  );
  // Users.associate = (models) => {
  //   // associations can be defined here
  // };
  return notifications;
};

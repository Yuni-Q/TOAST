// "use strict";
// const Sequelize = require('sequelize');

module.exports = (Sequelize, DataTypes) => {
  const alerts = Sequelize.define(
    'alerts', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
      tostId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
    }, {},
  );
  // Users.associate = (models) => {
  //   // associations can be defined here
  // };
  return alerts;
};

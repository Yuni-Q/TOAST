// "use strict";
// const Sequelize = require('sequelize');

module.exports = (Sequelize, DataTypes) => {
  const keeps = Sequelize.define(
    'keeps', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
      tostId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
    }, {},
  );
  // Users.associate = (models) => {
  //   // associations can be defined here
  // };
  return keeps;
};

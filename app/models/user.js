// "use strict";
// const Sequelize = require('sequelize');

module.exports = (Sequelize, DataTypes) => {
  const users = Sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nickName: DataTypes.STRING,
      email: DataTypes.STRING,
      token: DataTypes.STRING,
      password: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      profileImg: DataTypes.STRING,
      deviceToken: DataTypes.STRING,
      age: DataTypes.INTEGER,
      gender: DataTypes.STRING,
      authToken: DataTypes.STRING,
      type: DataTypes.STRING,
      admin: DataTypes.BOOLEAN,
      leave: DataTypes.BOOLEAN,
      auth: DataTypes.BOOLEAN,
    },
    {},
  );
  // Users.associate = (models) => {
  //   // associations can be defined here
  // };
  return users;
};

module.exports = (Sequelize, DataTypes) => {
  const questions = Sequelize.define(
    'questions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      // imgUrl: DataTypes.STRING,
      partId: DataTypes.INTEGER,
    }, {},
  );

  return questions;
};

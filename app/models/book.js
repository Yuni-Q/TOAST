module.exports = (Sequelize, DataTypes) => {
  const books = Sequelize.define(
    'books', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      imgUrl: DataTypes.STRING,
    }, {},
  );

  return books;
};

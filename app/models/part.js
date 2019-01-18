module.exports = (Sequelize, DataTypes) => {
  const parts = Sequelize.define(
    'parts', {
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
      bookId: DataTypes.INTEGER,
    }, {},
  );

  return parts;
};

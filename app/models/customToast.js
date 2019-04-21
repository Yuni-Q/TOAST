module.exports = (Sequelize, DataTypes) => {
  const customToasts = Sequelize.define(
    'customToasts', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      fileUrl: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    }, {},
  );

  return customToasts;
};

module.exports = (Sequelize, DataTypes) => {
  const toasts = Sequelize.define(
    'toasts', {
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
      questionId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      share: DataTypes.BOOLEAN,
    }, {},
  );

  return toasts;
};

module.exports = (Sequelize, DataTypes) => {
  const tosts = Sequelize.define(
    'tosts', {
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
      pastId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      share: DataTypes.BOOLEAN,
    }, {},
  );

  return tosts;
};

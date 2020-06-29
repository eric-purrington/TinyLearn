module.exports = function(sequelize, DataTypes) {
  const Page = sequelize.define("page", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defautValue: 0
    }
  });
  Page.associate = function(models) {
    Page.belongsTo(models.User, {
      foreignKey: {
        allowNull: false
      }
    });
  };
  return Page;
};

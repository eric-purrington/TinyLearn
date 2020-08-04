module.exports = function(sequelize, DataTypes) {
  const Page = sequelize.define("page", {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
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

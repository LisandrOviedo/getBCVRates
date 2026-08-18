"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tasas_BCV extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Tasas_BCV.init(
    {
      fecha: DataTypes.DATEONLY,
      eur: DataTypes.DECIMAL(18, 8),
      cny: DataTypes.DECIMAL(18, 8),
      try: DataTypes.DECIMAL(18, 8),
      rub: DataTypes.DECIMAL(18, 8),
      usd: DataTypes.DECIMAL(18, 8),
    },
    {
      sequelize,
      modelName: "Tasas_BCV",
    },
  );
  return Tasas_BCV;
};

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

  const parseDecimal = (value) => (value !== null ? parseFloat(value) : null);

  Tasas_BCV.init(
    {
      fecha: DataTypes.DATEONLY,
      eur: {
        type: DataTypes.DECIMAL(18, 8),
        get() {
          return parseDecimal(this.getDataValue("eur"));
        },
      },
      cny: {
        type: DataTypes.DECIMAL(18, 8),
        get() {
          return parseDecimal(this.getDataValue("cny"));
        },
      },
      try: {
        type: DataTypes.DECIMAL(18, 8),
        get() {
          return parseDecimal(this.getDataValue("try"));
        },
      },
      rub: {
        type: DataTypes.DECIMAL(18, 8),
        get() {
          return parseDecimal(this.getDataValue("rub"));
        },
      },
      usd: {
        type: DataTypes.DECIMAL(18, 8),
        get() {
          return parseDecimal(this.getDataValue("usd"));
        },
      },
    },
    {
      sequelize,
      modelName: "Tasas_BCV",
    },
  );
  return Tasas_BCV;
};

"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tasas_BCV", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      eur: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        comment: "Euro",
      },
      cny: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        comment: "Yuan chino",
      },
      try: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        comment: "Lira turca",
      },
      rub: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        comment: "Rublo ruso",
      },
      usd: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false,
        comment: "Dólar estadounidense",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Tasas_BCV");
  },
};

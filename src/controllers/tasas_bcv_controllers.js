const { Tasas_BCV } = require("../models");

const axios = require("axios");
const cheerio = require("cheerio");
const URL_BCV = "https://www.bcv.org.ve/";

const formatNumber = (number) => Number(number.replace(",", "."));

const todasLasTasas = async (fecha) => {
  try {
    if (fecha) {
      const tasasBD = await Tasas_BCV.findOne({
        where: {
          fecha,
        },
      });

      if (!tasasBD) {
        throw new Error(
          `No hay tasas registradas en la base de datos para esa fecha`,
        );
      }

      return tasasBD;
    } else {
      const hoy = new Date().toISOString().split("T")[0];

      const tasasBD = await Tasas_BCV.findOne({
        where: { fecha: hoy },
      });

      if (!tasasBD) {
        const response = await axios.get(URL_BCV, {
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        });

        if (response && response.data) {
          const $ = cheerio.load(response.data);

          const eur_currency = $("#euro strong").text();
          const cny_currency = $("#yuan strong").text();
          const try_currency = $("#lira strong").text();
          const rub_currency = $("#rublo strong").text();
          const usd_currency = $("#dolar strong").text();

          const [tasas, created] = await Tasas_BCV.findOrCreate({
            where: { fecha: hoy },
            defaults: {
              eur: formatNumber(eur_currency),
              cny: formatNumber(cny_currency),
              try: formatNumber(try_currency),
              rub: formatNumber(rub_currency),
              usd: formatNumber(usd_currency),
            },
            transaction: t,
          });

          return tasas;
        } else {
          throw new Error(
            `No se pudo consultar las tasas desde la página oficial`,
          );
        }
      }

      return tasasBD;
    }
  } catch (error) {
    throw new Error(`Error al traer las tasas BCV: ${error.message}`);
  }
};

module.exports = {
  todasLasTasas,
};

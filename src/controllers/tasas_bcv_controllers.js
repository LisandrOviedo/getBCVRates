const { sequelize, Tasas_BCV } = require("../models");

const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio");
const URL_BCV = "https://www.bcv.org.ve/";

const {
  formatNumber,
  getFechaLocal,
  esFechaValida,
} = require("../utils/tasas");

const todasLasTasas = async (fecha) => {
  try {
    // 1. Si se solicita una fecha específica
    if (fecha) {
      if (!esFechaValida(fecha)) {
        throw new Error(
          `Formato de fecha inválido: '${fecha}'. Debe ser una fecha válida en formato YYYY-MM-DD.`,
        );
      }

      const tasasBD = await Tasas_BCV.findOne({
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
        where: { fecha },
      });

      if (!tasasBD) {
        throw new Error(
          `No hay tasas registradas en la BD para la fecha: ${fecha}`,
        );
      }

      return tasasBD;
    }

    // 2. Si no se especificó fecha, usar la fecha de hoy (Local)
    const hoy = getFechaLocal();

    let tasasBD = await Tasas_BCV.findOne({
      attributes: {
        exclude: ["id", "createdAt", "updatedAt"],
      },
      where: { fecha: hoy },
    });

    if (tasasBD) return tasasBD;

    // 3. Scraping fuera de la transacción de base de datos
    const scrapingData = await scrapearTasasBCV();

    // 4. Guardar en BD (findOrCreate maneja concurrencia)
    const [tasas] = await Tasas_BCV.findOrCreate({
      where: { fecha: hoy },
      defaults: scrapingData,
    });

    const { id, createdAt, updatedAt, ...tasasLimpias } = tasas.toJSON();

    return tasasLimpias;
  } catch (error) {
    throw new Error(`Error al traer las tasas BCV: ${error.message}`);
  }
};

const actualizarTasasBCVAutomaticamente = async () => {
  const hoy = getFechaLocal();

  try {
    console.log(`[CRON] Iniciando actualización de tasas BCV para: ${hoy}...`);

    const scrapingData = await scrapearTasasBCV();

    const resultado = await sequelize.transaction(async (t) => {
      // Registra la tasa del día o la actualiza si ya existía
      const [tasas, created] = await Tasas_BCV.findOrCreate({
        where: { fecha: hoy },
        defaults: scrapingData,
        transaction: t,
      });

      if (!created) {
        // Si ya existía el registro del día, actualizamos los valores por si cambiaron
        await tasas.update(scrapingData, { transaction: t });
        
        console.log(`[CRON] Tasas actualizadas correctamente para ${hoy}`);
      } else {
        console.log(`[CRON] Nuevas tasas registradas exitosamente para ${hoy}`);
      }
    });
  } catch (error) {
    console.error(
      `[CRON ERROR] Error al ejecutar actualización automática: ${error.message}`,
    );
  }
};

const scrapearTasasBCV = async () => {
  try {
    const response = await axios.get(URL_BCV, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000, // 10 segundos de límite
    });

    if (!response?.data) {
      throw new Error("No se obtuvo respuesta de la página oficial");
    }

    const $ = cheerio.load(response.data);
    const eur = formatNumber($("#euro strong").text());
    const cny = formatNumber($("#yuan strong").text());
    const try_val = formatNumber($("#lira strong").text());
    const rub = formatNumber($("#rublo strong").text());
    const usd = formatNumber($("#dolar strong").text());

    if (isNaN(usd) || usd === 0) {
      throw new Error("Estructura HTML no válida o valores no encontrados");
    }

    return {
      eur,
      cny,
      try: try_val,
      rub,
      usd,
    };
  } catch (error) {
    throw new Error(`Error en scraping: ${error.message}`);
  }
};

module.exports = {
  todasLasTasas,
  actualizarTasasBCVAutomaticamente,
};

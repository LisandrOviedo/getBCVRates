const { sequelize, Tasas_BCV } = require("../models");

const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const URL_BCV = "https://www.bcv.org.ve/";

const { formatNumber, esFechaValida } = require("../utils/tasas");

const { fecha_actual_YYYYMMDD } = require("../utils/dayjs");

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

    // 2. Si no se especificó fecha, usar la fecha de hoy en Venezuela
    const hoy = fecha_actual_YYYYMMDD();

    let tasasBD = await Tasas_BCV.findOne({
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      where: { fecha: hoy },
    });

    // Fallback: si aún no existe la de hoy, trae la última disponible
    if (!tasasBD) {
      tasasBD = await Tasas_BCV.findOne({
        attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        order: [["fecha", "DESC"]],
      });
    }

    if (tasasBD) return tasasBD;

    // 3. Scraping fuera de la transacción de base de datos
    const scrapingData = await scrapearTasasBCV();

    // 4. Guardar en BD (findOrCreate maneja concurrencia)
    const [tasas] = await Tasas_BCV.findOrCreate({
      where: { fecha: scrapingData.fecha },
      defaults: scrapingData,
    });

    const { id, createdAt, updatedAt, ...tasasLimpias } = tasas.toJSON();

    return tasasLimpias;
  } catch (error) {
    throw new Error(`Error al traer las tasas BCV: ${error.message}`);
  }
};

const actualizarTasasBCVAutomaticamente = async () => {
  const hoy = fecha_actual_YYYYMMDD();

  try {
    console.log(`[CRON | ${hoy}] Iniciando actualización de tasas BCV...`);

    const scrapingData = await scrapearTasasBCV();

    const resultado = await sequelize.transaction(async (t) => {
      // Registra la tasa del día o la actualiza si ya existía
      const [tasas, created] = await Tasas_BCV.findOrCreate({
        where: { fecha: scrapingData.fecha },
        defaults: scrapingData,
        transaction: t,
      });

      if (!created) {
        // Si ya existía el registro del día, actualizamos los valores por si cambiaron
        await tasas.update(scrapingData, { transaction: t });

        console.log(`[CRON | ${hoy}] Tasas actualizadas correctamente`);
      } else {
        console.log(`[CRON | ${hoy}] Nuevas tasas registradas exitosamente`);
      }
    });
  } catch (error) {
    console.error(
      `[CRON | ${hoy}] Error al ejecutar actualización automática: ${error.message}`,
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
    const fecha = $(".date-display-single").attr("content");
    const eur = formatNumber($("#euro strong").text());
    const cny = formatNumber($("#yuan strong").text());
    const try_val = formatNumber($("#lira strong").text());
    const rub = formatNumber($("#rublo strong").text());
    const usd = formatNumber($("#dolar strong").text());

    if (isNaN(usd) || usd === 0 || !fecha) {
      throw new Error("Estructura HTML no válida o valores no encontrados");
    }

    return {
      fecha: dayjs.tz(fecha, "America/Caracas").format("YYYY-MM-DD"),
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

const { sequelize, Tasas_BCV } = require("../models");

const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio");
const URL_BCV = "https://www.bcv.org.ve/";

const formatNumber = (number) => Number(number.replace(",", "."));

// Función auxiliar para obtener YYYY-MM-DD en la zona horaria local
const getFechaLocal = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
};

const esFechaValida = (fechaStr) => {
  // 1. Verificar formato YYYY-MM-DD con Regex
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaStr)) return false;

  // 2. Verificar que sea una fecha válida en el calendario
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);

  return (
    fecha.getFullYear() === year &&
    fecha.getMonth() === month - 1 &&
    fecha.getDate() === day
  );
};

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

    // 4. Guardar en BD (findOrCreate maneja concurrencia)
    const [tasas] = await Tasas_BCV.findOrCreate({
      where: { fecha: hoy },
      defaults: {
        eur,
        cny,
        try: try_val,
        rub,
        usd,
      },
    });

    const { id, createdAt, updatedAt, ...tasasLimpias } = tasas.toJSON();

    return tasasLimpias;
  } catch (error) {
    throw new Error(`Error al traer las tasas BCV: ${error.message}`);
  }
};

module.exports = {
  todasLasTasas,
};

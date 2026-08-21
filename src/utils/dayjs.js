const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Obtener la fecha y hora actual en Venezuela
const fecha_actual_YYYYMMDD = () =>
  dayjs().tz("America/Caracas").format("YYYY-MM-DD");

module.exports = {
  fecha_actual_YYYYMMDD,
};

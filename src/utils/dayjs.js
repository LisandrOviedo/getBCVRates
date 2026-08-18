const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Obtener la fecha y hora actual en Venezuela
const fecha_hora_actual = () =>
  dayjs().tz("America/Caracas").format("DD/MM/YYYY");

module.exports = {
  fecha_hora_actual,
};

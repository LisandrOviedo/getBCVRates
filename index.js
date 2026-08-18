const express = require("express");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const router = require("./src/routes/index");
const { fecha_hora_actual } = require("./src/utils/dayjs");

const cron = require("node-cron");
const {
  actualizarTasasBCVAutomaticamente,
} = require("./src/controllers/tasas_bcv_controllers");

const app = express();

app.disable("x-powered-by");

const { PORT_SERVER } = process.env;

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutos
  limit: 50, // Limit each IP to 300 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive,
  message: {
    error: "Demasiadas solicitudes. Inténtalo de nuevo en 3 minutos.",
  },
});

morgan.token("fecha_hora_actual", () => fecha_hora_actual());

app.use(morgan(":fecha_hora_actual :method :url :status :response-time ms"));

app.use(express.json({ limit: "5mb" })); //Límite máximo en el tamaño de los datos JSON que el servidor puede manejar de una sola vez, para evitar posibles ataques de denegación de servicio (DoS) o abusos.

app.use(limiter);

app.use(router);

app.listen(PORT_SERVER, () => {
  console.log(`App listening on http://localhost:${PORT_SERVER}`);
});

cron.schedule(
  "0 0,19 * * 1-5", // Se ejecuta de Lunes a Viernes, a las 12 AM y a las 7 PM
  () => {
    actualizarTasasBCVAutomaticamente();
  },
  {
    scheduled: true,
    timezone: "America/Caracas", // Forzar la zona horaria a hora local
  },
);

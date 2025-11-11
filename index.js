const express = require("express");
const morgan = require("morgan");
const { fecha_hora_actual } = require("./dayjs");

const https = require("https");
const axios = require("axios");
const cheerio = require("cheerio");

const URL_BCV = "https://www.bcv.org.ve/";

const app = express();

app.disable("x-powered-by");

const port = 4055;

morgan.token("fecha_hora_actual", () => fecha_hora_actual());

app.use(morgan(":fecha_hora_actual :method :url :status :response-time ms"));

app.use(express.json({ limit: "65mb" })); //Límite máximo en el tamaño de los datos JSON que el servidor puede manejar de una sola vez, para evitar posibles ataques de denegación de servicio (DoS) o abusos.

const formatNumber = (number) => Number(number.replace(",", "."));

const getBCVRates = async (req, res) => {
  try {
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

      const tasas = {
        current_time_vzla: fecha_hora_actual(),
        eur: formatNumber(eur_currency),
        cny: formatNumber(cny_currency),
        try: formatNumber(try_currency),
        rub: formatNumber(rub_currency),
        usd: formatNumber(usd_currency),
      };

      res.json(tasas);
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
};

app.get("/", getBCVRates);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});

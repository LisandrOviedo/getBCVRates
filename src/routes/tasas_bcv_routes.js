const { Router } = require("express");

const { getTasasBCV } = require("../handlers/tasas_bcv_handlers");

const tasas_bcv = Router();

tasas_bcv.get("/", getTasasBCV);

module.exports = tasas_bcv;

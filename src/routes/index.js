const { Router } = require("express");

const tasas_bcv = require("./tasas_bcv_routes");

const router = Router();

router.use("/", tasas_bcv);

module.exports = router;

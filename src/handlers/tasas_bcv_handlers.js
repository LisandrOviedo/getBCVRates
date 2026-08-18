const { todasLasTasas } = require("../controllers/tasas_bcv_controllers");

const getTasasBCV = async (req, res) => {
  const { fecha } = req.query;

  try {
    const response = await todasLasTasas(fecha);

    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTasasBCV,
};

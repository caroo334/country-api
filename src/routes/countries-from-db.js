const countriesFromDBRouter = require("express").Router();
const {
  getAllCountries,
  getCountries,
  getCountryByCode,
  createActivity,
} = require("../controller/controller-countries-from-db");

//  Endpoint que carga toda la información de la API externa en nuestra DB.
countriesFromDBRouter.route("/initial-data").get(async (req, res) => {
  try {
    const allCountries = await getAllCountries();

    res.status(200).json(allCountries);
  } catch (error) {
    res.status(500).json({
      error,
      msj: `An error ocurred ${error}`,
    });
  }
});
//-----------

// Este Endpoint me trae la data de la DB y FILTRO por nombre
countriesFromDBRouter
  .route("/")
  .get(async (req, res) => {
    try {
      const { name } = req.query;

      const countries = await getCountries(name);

      res.status(200).json(countries);
    } catch (error) {
      res.status(500).json({
        msj: `An error ocurred: ${error}`,
        error,
      });
    }
  })
  .post(async (req, res) => {
    try {
      const body = req.body;

      const activityCreated = await createActivity(body);

      res.status(200).json(activityCreated);
    } catch (error) {
      res.status(500).json({
        msj: `An error ocurred: ${error}`,
        error,
      });
    }
  });

// Filtro por codigo para el DETAIL
countriesFromDBRouter.route("/:country_code").get(async (req, res) => {
  try {
    const { country_code } = req.params;

    const country = await getCountryByCode(country_code);

    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({
      msj: `An error ocurred: ${error}`,
      error,
    });
  }
});

module.exports = countriesFromDBRouter;

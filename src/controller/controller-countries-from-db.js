const axios = require("axios");
const { Country, Activity, ActivityXCountry } = require("../db");

//  Endpoint que carga toda la información de la API externa en nuestra DB.
async function getAllCountries() {
  try {
    const { data } = await axios.get(`${process.env.API_URL}/all`);

    const checkIfPropertyExist = (property) => {
      if (property) {
        if (Array.isArray(property)) return property[0];
        return property;
      }

      return null;
    };

    const countriesFormated = data.map((c) => ({
      name: c.name.common,
      flags: checkIfPropertyExist(c.flags),
      population: c.population,
      capital: checkIfPropertyExist(c.capital),
      continents: checkIfPropertyExist(c.continents),
      subregion: c.subregion,
      area: c.area,
      code: c.cca2 || c.ccn3 || cca3,
    }));

    await Country.bulkCreate(countriesFormated);

    return await Country.findAll();
  } catch (error) {
    throw new Error(error);
  }
}
// -----------------

function capitalizarPrimeraLetra(name) {
  const nameFormated = name.toLowerCase();
  const resultado =
    nameFormated.charAt(0).toUpperCase() + nameFormated.slice(1);
  return resultado;
}

// Este Endpoint me trae la data de la DB y FILTRO por nombre
async function getCountries(continents) {
  try {
    let queryFromDB;

    //Esto para que filtre por el nombre, sino me trae la data
    if (continents) {
      queryFromDB = async function getCountriesFromDb() {
        return await Country.findAll({
          where: {
            continents: capitalizarPrimeraLetra(continents),
          },
          include: [
            {
              model: Activity,
            },
          ],
        });
      };
    } else {
      queryFromDB = async function getCountriesFromDb() {
        return await Country.findAll({
          include: [
            {
              model: Activity,
            },
          ],
        });
      };
    }

    let countries = await queryFromDB();

    //Esto chequea que haya info en la db, sino la carga
    if (countries.length > 0) {
      return countries;
    } else {
      await getAllCountries();
      countries = await queryFromDB();
    }

    return countries;
  } catch (error) {
    throw new Error(error);
  }
}

// Filtro por codigo para el DETAIL
async function getCountryByCode(countryCode) {
  try {
    const country = await Country.findAll({
      where: {
        code: countryCode,
      },
      include: [
        {
          model: Activity,
        },
      ],
    });

    return country;
  } catch (error) {
    throw new Error(error);
  }
}

async function createActivity(activity) {
  try {
    console.log("activity", activity);

    const { name, difficulty, duration, season, countries } = activity;

    const activityCreated = await Activity.create({
      name: name.value,
      difficulty: difficulty.value,
      duration: duration.value,
      season: season.value,
    });

    const countriesToAddtoActivity = countries.value.map((country) => ({
      ActivityId: activityCreated.dataValues.id,
      CountryId: country.id,
    }));

    const activityXCountry = await ActivityXCountry.bulkCreate(
      countriesToAddtoActivity
    );

    return activityXCountry;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  getAllCountries,
  getCountries,
  getCountryByCode,
  createActivity,
};

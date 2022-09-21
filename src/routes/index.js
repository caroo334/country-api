const express = require('express');
const countriesFromDBRouter = require('./countries-from-db')


const router = express();

router.use(express.json());

// Configurar los routers
router.use('/countriesFromDB', countriesFromDBRouter)


module.exports = router;

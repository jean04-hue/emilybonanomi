const { MercadoPagoConfig } = require('mercadopago');

// Opcional: Garante o carregamento do dotenv caso não tenha feito no arquivo principal
// require('dotenv').config(); 

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

module.exports = client;
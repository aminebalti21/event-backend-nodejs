require('dotenv').config();  // Charger les variables .env

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Assurez-vous que votre clé Stripe est dans .env

module.exports = stripe;

require('dotenv').config();  // Charger les variables .env

const stripe = require('stripe')('sk_test_51QbkFwP8MTu6V2mmdaF65fFn0nupTl6G3XKe7FgXm7sIeSBGRPYa2TyDA63FQM2dOMrX2e7oARC59RwAZfpO1iOk0019lSstL8'); // Assurez-vous que votre clé Stripe est dans .env

module.exports = stripe;

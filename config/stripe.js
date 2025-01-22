// config/stripe.js
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51QbkFwP8MTu6V2mmdaF65fFn0nupTl6G3XKe7FgXm7sIeSBGRPYa2TyDA63FQM2dOMrX2e7oARC59RwAZfpO1iOk0019lSstL8');

module.exports = stripe;

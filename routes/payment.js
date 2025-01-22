const express = require('express');
const stripe = require('../config/stripe');
const db = require('../config/database');
const { Ticket ,Event,User } = require('../models');
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
    const { ticketType, eventId, userId } = req.body;

    try {
        // Récupérez les détails du billet et calculez le prix.
        const price = await calculateTicketPrice(ticketType, eventId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ticket ${ticketType}`,
                            description: `Ticket pour l'événement ${eventId}`,
                        },
                        unit_amount: price * 100, // Le montant doit être en cents.
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:4200/payment-success',
            cancel_url: 'http://localhost:4200/payment-cancel',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
});
router.post('/save-ticket', async (req, res) => {
    const { eventId, userId, type, status, price, purchasedAt } = req.body;

    try {
        // Crée un nouveau ticket avec les données fournies
        const newTicket = await Ticket.create({
            eventId,
            userId,
            type,
            status,
            price,
            purchasedAt: purchasedAt || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ message: 'Ticket enregistré avec succès.', ticket: newTicket });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du ticket :', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


module.exports = router;

async function calculateTicketPrice(ticketType, eventId) {
    // Exemple : obtenir le prix depuis une base de données.
    // Ajustez selon votre logique métier.
    const basePrice = 100; // Exemple de prix de base.
    return basePrice * (ticketType === 'VIP' ? 2 : 1);
}

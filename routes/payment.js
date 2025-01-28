const express = require('express');
const stripe = require('../config/stripe');
const db = require('../config/database');
const { Ticket, Event, User } = require('../models');
const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
    const { ticketType, eventId, userId } = req.body;

    try {
        // Récupérez le prix du billet en fonction du type et de l'événement
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
                        unit_amount: price,  // Le montant doit être en centimes.
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:4200/participant',
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
    // Récupérer l'événement dans la base de données en fonction de l'eventId
    const event = await Event.findByPk(eventId);

    if (!event) {
        throw new Error('Événement non trouvé');
    }

    // Calcul du prix en fonction du type de ticket
    let price;

    switch (ticketType) {
        case 'Premium':
            price = event.pricePremium || 60;  // Si le prix n'est pas défini, utilise un prix par défaut
            break;
        case 'VIP':
            price = event.priceVIP || 100;  // Si le prix n'est pas défini, utilise un prix par défaut
            break;
        case 'Standard':
        default:
            price = event.priceStandard || 30;  // Si le prix n'est pas défini, utilise un prix par défaut
            break;
    }

    return price;
}

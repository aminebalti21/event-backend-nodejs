const express = require('express');
const stripe = require('../config/stripe');  // Assurez-vous d'avoir configuré Stripe dans config/stripe.js
const router = express.Router();
const { User, Event, Ticket } = require('..');  // Importer les modèles
  // Stripe
// Route pour créer un paiement
router.post('/payment', async (req, res) => {
    try {
        const { amount, currency = 'usd', description } = req.body;

        // Créer un PaymentIntent sur Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // Montant à payer en cents (ex : 10.00$ -> 1000)
            currency,  // Monnaie, par exemple 'usd'
            description,  // Description du paiement (par exemple, "Billet pour un événement")
            payment_method_types: ['card'],  // Type de méthode de paiement (carte de crédit)
        });

        // Retourner le secret client (utilisé dans le frontend pour finaliser le paiement)
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error("Erreur lors de la création du paiement :", error);
        res.status(500).json({ error: 'Erreur interne lors du traitement du paiement.' });
    }
});


router.post('/purchase', async (req, res) => {
    try {
        const { eventId, userId, amount, token, ticketType } = req.body;

        // 1. Vérifier si l'événement existe
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Événement non trouvé.' });
        }

        // Vérifier la capacité de l'événement
        const totalTicketsSold = await Ticket.count({ where: { eventId } });
        if (totalTicketsSold >= event.capacity) {
            return res.status(400).json({ error: 'Cet événement est complet.' });
        }

        // 2. Créer le PaymentIntent avec Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,  // Montant à payer en cents
            currency: 'usd',
            payment_method: token,  // Token Stripe obtenu
            confirmation_method: 'manual',
            confirm: true,
        });

        // 3. Vérifier le statut du paiement
        if (paymentIntent.status === 'succeeded') {
            // 4. Créer le ticket pour l'utilisateur
            const ticket = await Ticket.create({
                eventId,
                userId,
                type: ticketType,
                status: 'paid',
                price: amount,
                purchasedAt: new Date(),
            });

            // 5. Réponse avec le ticket créé
            res.status(200).json({ message: 'Paiement réussi et billet créé!', ticket });
        } else {
            res.status(400).json({ error: 'Le paiement a échoué.' });
        }
    } catch (error) {
        console.error('Erreur lors de l\'achat du billet :', error);
        res.status(500).json({ error: 'Erreur interne lors de l\'achat du billet.', details: error.message });
    }
});


module.exports = router;

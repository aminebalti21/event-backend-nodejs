const express = require('express');
const paypal = require('paypal-rest-sdk'); // Assurez-vous d'avoir installé paypal-rest-sdk
const router = express.Router();

// Configuration de PayPal (remplacez par vos informations)
paypal.configure({
  mode: 'sandbox', // Passez à 'live' en production
  client_id: 'AaoAiRjuXHF7LH0KY9Pilzd_dbArjsqDzoIfNTLwzmpPaziNs5dxlWtTUIOobAGrHvK5Vc-Pn2JyQRKH', // Remplacez par votre client ID PayPal
  client_secret: 'EDHAYTg5HVKALExo4ndTP8NdnxnVHZDM5XCCLIklFx7GcQE-1vjcsa2TkmK7XG5FO9U0-36yq1sHXeBj', // Remplacez par votre secret PayPal
});

// Route pour créer un paiement PayPal
router.post('/payment', (req, res) => {
  const { amount, currency = 'USD', description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide.' });
  }

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/payments/success', // URL de retour après le paiement réussi
      cancel_url: 'http://localhost:3000/payments/cancel', // URL si l'utilisateur annule le paiement
    },
    transactions: [
      {
        amount: {
          total: amount.toString(), // Montant en string
          currency: currency,
        },
        description: description || 'Paiement pour un billet',
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('Erreur PayPal:', error.response || error.message || error);
      res.status(500).json({ error: 'Erreur lors de la création du paiement.' });
    } else {
      const approvalUrl = payment.links.find((link) => link.rel === 'approval_url');
      res.status(200).json({ approvalUrl: approvalUrl.href });
    }
  });
  
});
router.get('/success', async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    if (!payerId || !paymentId) {
      return res.status(400).json({ error: 'Données manquantes.' });
    }
  
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            total: req.query.amount, // Montant envoyé en paramètre de l'URL
            currency: 'USD',
          },
        },
      ],
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'exécution du paiement.' });
      } else {
        // Créer un ticket après paiement réussi
        const ticket = await Ticket.create({
          eventId: req.query.eventId,
          userId: req.query.userId,
          type: req.query.ticketType || 'Standard',
          status: 'paid',
          price: req.query.amount,
          purchasedAt: new Date(),
        });
  
        res.status(200).json({ message: 'Paiement réussi et billet créé !', ticket });
      }
    });
  });
  

module.exports = router;

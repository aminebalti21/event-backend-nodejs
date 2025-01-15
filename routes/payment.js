const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Fonction pour générer un token d'accès PayPal
async function generateAccessToken() {
  try {
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: 'post',
      data: 'grant_type=client_credentials',
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur lors de la génération du token PayPal:', error.response?.data || error.message);
    throw new Error('Impossible de générer un token PayPal.');
  }
}

// Route pour créer une commande PayPal
router.post('/create-order', async (req, res) => {
  const { amount, currency = 'USD', description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide.' });
  }

  try {
    const accessToken = await generateAccessToken();
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: description || 'Paiement pour un billet',
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        },
      },
    });

    const approvalUrl = response.data.links.find((link) => link.rel === 'approve').href;
    res.status(200).json({ approvalUrl, orderId: response.data.id });
  } catch (error) {
    console.error('Erreur lors de la création de l\'ordre PayPal:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur lors de la création du paiement.' });
  }
});

module.exports = router;

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sequelize, Ticket, Event, participant } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/:participantId/payment", authenticateToken, async (req, res) => {
    try {
        const { participantId } = req.params;
        const { paymentMethodId } = req.body;

        const participant = await Participant.findByPk(participantId);
        if (!participant) {
            return res.status(404).json({ error: "Participant non trouvé." });
        }

        if (participant.userId !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        const event = await Event.findByPk(participant.eventId);
        if (!event) {
            return res.status(404).json({ error: "Événement non trouvé." });
        }

        const price = participant.ticketType === "VIP" ? 100 : participant.ticketType === "Premium" ? 50 : 30;

        // Créer un paiement Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100, // Prix en cents
            currency: "EUR",
            payment_method: paymentMethodId,
            confirm: true,
        });

        if (paymentIntent.status === "succeeded") {
            const ticket = await Ticket.create({
                userId: participant.userId,
                eventId: participant.eventId,
                type: participant.ticketType,
                status: "paid",
                price: price * 100,
                purchasedAt: new Date(),
            });

            res.status(201).json({ message: "Paiement réussi et billet créé.", ticket });
        } else {
            res.status(400).json({ error: "Le paiement n'a pas été finalisé." });
        }
    } catch (error) {
        console.error("Erreur lors du paiement :", error.message);
        res.status(500).json({ error: "Erreur lors du paiement.", details: error.message });
    }
});
router.get('/tickets-by-type', async (req, res) => {
    try {
      const tickets = await Ticket.findAll({
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('type')), 'count']],
        group: ['type'],
      });
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du chargement des tickets par type.' });
    }
  });
  
  router.get('/tickets-by-status', async (req, res) => {
    try {
      const tickets = await Ticket.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
        group: ['status'],
      });
      res.json(tickets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du chargement des statuts des tickets.' });
    }
  });
  router.get('/stats', async (req, res) => {
    try {
      
      const totalPaid = await Ticket.sum('price');
  
      res.json({ totalParticipants, totalEvents, totalPaid });
    } catch (err) {
      res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
  });
  
  // Récupérer les tickets de l'utilisateur connecté
  router.get("/my-tickets", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const tickets = await Ticket.findAll({
            where: { userId, status: "paid" },
            include: [{ model: Event, attributes: ["title", "date", "location"] }]
        });

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Erreur lors de la récupération des tickets :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des tickets." });
    }
});


module.exports = router;

const express = require("express");
const { Ticket, Event, Participant } = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Acheter un billet pour un événement
router.post("/:participantId", authenticateToken, async (req, res) => {
    try {
        const { participantId } = req.params;
        const { paymentMethod, price, ticketType } = req.body;

        // Vérifier si le participant existe
        const participant = await Participant.findByPk(participantId);
        if (!participant) {
            return res.status(404).json({ error: "Participant non trouvé." });
        }

        // Vérifier si l'utilisateur correspond au participant
        if (participant.userId !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        // Vérifier l'événement lié
        const event = await Event.findByPk(participant.eventId);
        if (!event) {
            return res.status(404).json({ error: "Événement non trouvé." });
        }

        // Créer le billet
        const ticket = await Ticket.create({
            userId: participant.userId,
            eventId: participant.eventId,
            type: ticketType || "Standard", // Par défaut, type Standard
            status: "paid", // Statut payé après l'achat
            price: price,
            purchasedAt: new Date()
        });

        res.status(201).json({ message: "Billet acheté avec succès.", ticket });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'achat du billet.", details: error.message });
    }
});

// Récupérer les billets d'un utilisateur
router.get("/", authenticateToken, async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { userId: req.user.id },
            include: [{ model: Event, attributes: ["title", "date", "location"] }]
        });

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des billets." });
    }
});

module.exports = router;

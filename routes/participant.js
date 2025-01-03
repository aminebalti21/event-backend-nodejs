const express = require("express");


const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

const { Event, Participant, User } = require("../models");

// Inscription d'un participant à un événement
router.post("/:eventId", authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;  // Assurez-vous que l'utilisateur est authentifié

        console.log("User ID:", userId, "Event ID:", eventId);

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ error: "Événement non trouvé." });
        }

        console.log("Événement trouvé:", event);

        if (event.maxCapacity <= 0) {
            return res.status(400).json({ error: "Capacité maximale atteinte." });
        }

        const ticketType = req.body.ticketType || "Standard"; // Le type de billet par défaut
        console.log("Ticket Type:", ticketType);

        const participant = await Participant.create({
            userId,
            eventId,
            ticketType,
            status: "Inscrit",
        });

        console.log("Participant créé:", participant);

        event.maxCapacity -= 1;
        await event.save();
        console.log("Capacité mise à jour:", event.maxCapacity);

        res.status(201).json(participant);
    } catch (error) {
        console.error("Erreur:", error); // Log complet de l'erreur
        res.status(400).json({ error: "Erreur lors de l'inscription au participant.", details: error.message });
    }
});

module.exports = router;

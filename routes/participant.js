const express = require("express");


const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

const { sequelize, Ticket, Event, Participant } = require("../models");

// Inscription d'un participant à un événement
router.post("/:eventId", authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;  // Assurez-vous que l'utilisateur est authentifié

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ error: "Événement non trouvé." });
        }

        if (event.maxCapacity <= 0) {
            return res.status(400).json({ error: "Capacité maximale atteinte." });
        }

        const ticketType = req.body.ticketType || "Standard"; // Le type de billet par défaut
        let price;

        // Calcul du prix en fonction du type de ticket
        switch (ticketType) {
            case 'Premium':
                price = 60; // Exemple de prix en centimes pour Premium
                break;
            case 'VIP':
                price = 100; // Exemple de prix en centimes pour VIP
                break;
            case 'Standard':
            default:
                price = 30; // Exemple de prix en centimes pour Standard
                break;
        }

        const participant = await Participant.create({
            userId,
            eventId,
            ticketType,
             // Ajouter le prix dans le participant
            status: "Inscrit",
            price,
        });

        event.maxCapacity -= 1;
        await event.save();

        res.status(201).json({
            ticketType: participant.ticketType,
            amount: price, // Retourner le prix
            eventId: eventId,
            userId: userId,
        });
    } catch (error) {
        console.error("Erreur:", error);
        res.status(400).json({ error: "Erreur lors de l'inscription.", details: error.message });
    }
});
router.get("/users-per-event", async (req, res) => {
    try {
      const usersPerEvent = await Ticket.findAll({
        attributes: [
          "eventId",
          [sequelize.fn("COUNT", sequelize.col("userId")), "userCount"]
        ],
        include: [
          {
            model: Event,
            attributes: ["title"],
          },
        ],
        group: ["eventId", "Event.id"],
      });
  
      res.status(200).json(usersPerEvent);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs par événement :", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  });
  
  router.get('/top-events', async (req, res) => {
    try {
      const tickets = await Ticket.findAll({
        attributes: ['eventId', [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
        group: ['eventId'],
        include: [{ model: Event, attributes: ['title'] }],
        order: [[sequelize.fn('COUNT', sequelize.col('userId')), 'DESC']],
        limit: 5,
      });
  
      const result = tickets.map((ticket) => ({
        eventId: ticket.eventId,
        title: ticket.Event.title,
        count: ticket.dataValues.count,
      }));
  
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du chargement des meilleurs événements.' });
    }
  });
    
  router.get('/stats', async (req, res) => {
    try {
      const totalParticipants = await Participant.count(); // Nombre total de participants
      const totalEvents = await Event.count(); // Nombre total d'événements
      const totalPaid = await Ticket.sum('price'); // Somme des montants payés (assurez-vous que `price` est un champ dans `Ticket`)
  
      res.json({ totalParticipants, totalEvents, totalPaid });
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques :', err);
      res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
  });
  
  
module.exports = router;

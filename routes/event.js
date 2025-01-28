const express = require("express");
const multer = require("multer");
const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");
const { Event } = require("../models"); // Assurez-vous d'utiliser cette importation si vous avez un index.js dans models

const router = express.Router();

// Configuration de Multer pour le stockage des photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Répertoire où les photos seront stockées
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname); // Nom unique pour éviter les conflits
    },
});
const upload = multer({ storage });

// Créer un événement (Organisateurs uniquement)
router.post(
    "/create",
    authenticateToken,
    authorizeRole(["Admin", "Organisateur"]),
    upload.single("photo"), // Gestion du fichier photo
    async (req, res) => {
        try {
            const { title, description, location, date, time, maxCapacity, type, theme } = req.body;

            // Ajoutez un log pour vérifier ce qui est envoyé
            console.log("Données reçues pour la création de l'événement : ", req.body);

            const event = await Event.create({
                title,
                description,
                location,
                date,
                time,
                maxCapacity,
                type,
                theme,
                photo: req.file ? req.file.path : null, // Ajout du chemin de la photo
            });

            res.status(201).json(event);
        } catch (error) {
            console.error("Erreur lors de la création de l'événement : ", error);

            res.status(400).json({
                error: "Erreur lors de la création de l'événement.",
                details: error.message,
            });
        }
    }
);

// Lire tous les événements
router.get("/", async (req, res) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (error) {
        res.status(400).json({ error: "Erreur lors de la récupération des événements." });
    }
});


// Lire un événement par son ID
router.get("/:id", async (req, res) => {
    try {
        const eventId = req.params.id;

        // Chercher l'événement dans la base de données
        const event = await Event.findByPk(eventId); // Utilisation de findByPk pour trouver l'événement par son ID

        if (!event) {
            return res.status(404).json({ error: "Événement non trouvé." });
        }

        // Retourner l'événement trouvé
        res.json(event);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'événement : ", error);
        res.status(400).json({ error: "Erreur lors de la récupération de l'événement." });
    }
});


// Mettre à jour un événement (Organisateurs uniquement)
router.put(
    "/:id",
    authenticateToken,
    authorizeRole(["Admin", "Organisateur"]),
    upload.single("photo"), // Gestion du fichier photo pour la mise à jour
    async (req, res) => {
        try {
            const { title, description, location, date, time, maxCapacity, type, theme } = req.body;
            const photo = req.file ? `uploads/${req.file.filename}` : null; // Vérifie si une photo a été uploadée
        
            const event = await Event.update(
              { title, description, location, date, time, maxCapacity, type, theme, photo },
              { where: { id: req.params.id } }
            );
        
            res.status(200).json({ message: "Événement mis à jour." });
          } catch (error) {
            res.status(400).json({ error: "Erreur lors de la mise à jour de l'événement." });
          }
        });


// Supprimer un événement (Admins uniquement)
router.delete("/:id", authenticateToken, authorizeRole(["Admin", "Organisateur"]), async (req, res) => {
    try {
        await Event.destroy({ where: { id: req.params.id } });
        res.json({ message: "Événement supprimé." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'événement : ", error);
        res.status(400).json({ error: "Erreur lors de la suppression de l'événement." });
    }
});

router.get('/stats', async (req, res) => {
    try {
     
      const totalEvents = await Event.count();
      
  
      res.json({ totalParticipants, totalEvents, totalPaid });
    } catch (err) {
      res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
  });
  

module.exports = router;

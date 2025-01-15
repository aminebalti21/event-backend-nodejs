const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");
const { User } = require("../models");

// Route protégée : Liste des utilisateurs (accessible uniquement par les administrateurs)
router.get("/users", authenticateToken, authorizeRole(["Admin"]), async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ["id", "name", "email", "role"] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
});

// Route protégée : Modifier un utilisateur (accessible uniquement par les administrateurs)
router.put("/users/:id", authenticateToken, authorizeRole(["Admin"]), async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        // Mettre à jour les champs de l'utilisateur
        await user.update({ name, email, role });
        res.json({ message: "Utilisateur mis à jour avec succès.", user });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});

// Route protégée : Supprimer un utilisateur (accessible uniquement par les administrateurs)
router.delete("/users/:id", authenticateToken, authorizeRole(["Admin"]), async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        // Supprimer l'utilisateur
        await user.destroy();
        res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
});


module.exports = router;

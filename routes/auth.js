const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Utilisation de la déstructuration pour accéder uniquement au modèle User

const router = express.Router();

// Route d'inscription
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        console.error("Erreur de création d'utilisateur : ", error);  // Affiche l'erreur dans la console
        res.status(400).json({ error: "Erreur lors de la création de l'utilisateur.", details: error.message });
    }
});


// Route de connexion
router.post("/login", async (req, res) => { // Changer GET en POST
    const { name, password } = req.body;

    try {
        const user = await User.findOne({ where: { name } }); // Vérifie si l'utilisateur existe
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé." });

        const isValid = await bcrypt.compare(password, user.password); // Compare les mots de passe
        if (!isValid) return res.status(401).json({ error: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Connexion réussie.", token });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(400).json({ error: "Erreur lors de la connexion." });
    }
});
module.exports = router;

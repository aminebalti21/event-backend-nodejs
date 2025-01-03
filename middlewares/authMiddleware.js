const jwt = require("jsonwebtoken");

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Récupérer le token après "Bearer "
    if (!token) return res.status(401).json({ error: "Token manquant." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide." });
        req.user = user; // Ajouter les informations utilisateur au req
        next();
    });
};

// Middleware pour vérifier le rôle
const authorizeRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Accès non autorisé pour ce rôle." });
    }
    next();
};

module.exports = { authenticateToken, authorizeRole };

const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, User, Event, Participant, Ticket } = require("./models");
const authRoutes = require("./routes/auth");
const loginRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const participantRoutes = require("./routes/participant");
const paymentRoutes = require("./routes/payment");
const ticketRoutes = require("./routes/ticket");
const cors = require('cors');
const app = express();
const path = require("path");
app.use(bodyParser.json());

app.use(cors())

app.use("/uploads", express.static(path.join(__dirname, "uploads")));





app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/payments", paymentRoutes);
app.use("/participants", participantRoutes);
app.use("/tickets", ticketRoutes);

sequelize.sync({ alter: true })  // Utilisez { alter: true } en production
    .then(() => {
        console.log("Base de données synchronisée");
        app.listen(3000, () => {
            console.log("Serveur démarré sur http://localhost:3000");
        });
    })
    .catch((err) => {
        console.error("Erreur lors de la synchronisation :", err);
    });

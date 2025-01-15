const express = require("express");
const bodyParser = require("body-parser");
const { sequelize, User, Event, Participant, Ticket } = require("./models");
const authRoutes = require("./routes/auth");
const loginRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const participantRoutes = require("./routes/participant");
const paymentRoutes = require("./routes/payment");
const ticketRoutes = require("./routes/ticket");
const usersRoutes = require("./routes/users");
const cors = require('cors');
require('dotenv').config()
const app = express();
const path = require("path");
app.use(bodyParser.json());

app.use(cors())

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/payment', async(req, res) => {
    try {
        const url = await paypal.createOrder()

        res.redirect(url)
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/complete-order', async (req, res) => {
    try {
        await paypal.capturePayment(req.query.token)

        res.send('Course purchased successfully')
    } catch (error) {
        res.send('Error: ' + error)
    }
})

app.get('/cancel-order', (req, res) => {
    res.redirect('/')
})



app.use('/users', usersRoutes);
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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Ticket } = require('../models');

exports.createPaymentSession = async (req, res) => {
    try {
        const { eventId, ticketType, price } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ticket ${ticketType} pour l'événement ${eventId}`,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/payment-cancel`,
        });

        res.json({ id: session.id });
    } catch (err) {
        console.error("Erreur lors de la création de la session de paiement:", err);
        res.status(500).send("Erreur de paiement.");
    }
};

exports.handleWebhook = async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Update ticket status to paid
        const ticket = await Ticket.findOne({ where: { eventId: session.client_reference_id, userId: session.customer } });
        if (ticket) {
            ticket.status = 'paid';
            ticket.purchasedAt = new Date();
            await ticket.save();
        }
    }

    res.status(200).send('Event received');
};

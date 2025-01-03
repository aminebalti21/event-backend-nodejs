const Sequelize = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User")(sequelize, Sequelize.DataTypes);
const Event = require("./Event")(sequelize, Sequelize.DataTypes);
const Participant = require("./Participant")(sequelize, Sequelize.DataTypes);
const Ticket = require("./Ticket")(sequelize, Sequelize.DataTypes);


const models = { User, Event, Participant, Ticket };
// Associer les modèles entre eux après les définitions
User.associate({ Participant });
Event.associate({ Participant });
Participant.associate({ User, Event });
Ticket.associate({ User, Event });


module.exports = { User, Event, Participant,Ticket, sequelize };

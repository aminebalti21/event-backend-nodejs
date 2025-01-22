// models/Ticket.js
module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define("Ticket", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Events',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.STRING, // 'Standard', 'VIP', etc.
            allowNull: false
        },
        status: {
            type: DataTypes.STRING, // 'paid', 'pending', 'cancelled'
            allowNull: false,
            defaultValue: 'pending'
        },
        price: {
            type: DataTypes.INTEGER, // Prix en cents
            allowNull: true
        },
        purchasedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });

    Ticket.associate = (models) => {
        Ticket.belongsTo(models.User, { foreignKey: "userId" });
        Ticket.belongsTo(models.Event, { foreignKey: "eventId" });
    };

    return Ticket;
};

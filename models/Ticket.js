module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('Ticket', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Events',  // Lien avec le modèle des événements
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',  // Lien avec le modèle des utilisateurs
                key: 'id'
            }
        },
        type: {
            type: DataTypes.STRING,  // Par exemple, 'Standard', 'VIP', etc.
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,  // Par exemple, 'paid', 'pending', 'cancelled'
            allowNull: false,
            defaultValue: 'pending'
        },
        price: {
            type: DataTypes.INTEGER,  // Montant du billet en cents (par exemple, 1000 = 10.00$)
            allowNull: false
        },
        purchasedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });

    // Associations
    Ticket.associate = (models) => {
        Ticket.belongsTo(models.Event, { foreignKey: 'eventId' });
        Ticket.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Ticket;
};

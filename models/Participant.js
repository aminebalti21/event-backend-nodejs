module.exports = (sequelize, DataTypes) => {
    const Participant = sequelize.define('Participant', {
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        eventId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Events',
                key: 'id',
            },
        },
        ticketType: {
            type: DataTypes.ENUM('Standard', 'Premium', 'VIP'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Inscrit', 'En Attente', 'Annulé'),
            defaultValue: 'Inscrit',
        },
        price: { // Ajout du prix pour chaque ticket
            type: DataTypes.INTEGER, // Le prix sera stocké en centimes
            allowNull: false
        },
    });

    // Définir les relations
    Participant.associate = (models) => {
        Participant.belongsTo(models.User, { foreignKey: "userId" });
        Participant.belongsTo(models.Event, { foreignKey: "eventId" });
    };
    

    return Participant;
};

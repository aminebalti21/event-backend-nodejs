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
    });

    // Définir les relations
    Participant.associate = (models) => {
        Participant.belongsTo(models.User, { foreignKey: "userId" });
        Participant.belongsTo(models.Event, { foreignKey: "eventId" });
    };
    

    return Participant;
};

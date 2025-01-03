module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
        title: {
            type: DataTypes.STRING,
            allowNull: false, // Le titre de l'événement ne doit pas être nul
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false, // La description doit être renseignée
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false, // Le lieu doit être renseigné
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false, // La date doit être renseignée
        },
        time: {
            type: DataTypes.TIME,
            allowNull: false, // L'heure doit être renseignée
        },
        maxCapacity: {
            type: DataTypes.INTEGER,
            allowNull: false, // La capacité maximale doit être renseignée
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false, // Le type doit être renseigné
        },
        theme: {
            type: DataTypes.STRING,
            allowNull: false, // Le thème doit être renseigné
        },
        photo: {
            type: DataTypes.STRING, // Stocke le chemin ou l'URL de la photo
            allowNull: true, // La photo est optionnelle
        },
    });

    // Définir la relation avec Participant
    Event.associate = (models) => {
        Event.hasMany(models.Participant, { foreignKey: 'eventId' });
    };

    return Event;
};

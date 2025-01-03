module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false, // Ce champ ne doit pas être nul
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // L'email doit être unique
            validate: {
                isEmail: true, // Validation du format d'email
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('Admin', 'Organisateur', 'Participant'), // Définition des rôles
            defaultValue: 'Participant', // Valeur par défaut
        },
    });

    // Définir la relation avec Participant
    User.associate = (models) => {
        User.hasMany(models.Participant, { foreignKey: 'userId' });
    };

    return User;
};

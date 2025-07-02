// src/models/Users.ts

import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../config/database';




class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: 'user' | 'admin';
}


User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
    }
}, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: true
});

export default User
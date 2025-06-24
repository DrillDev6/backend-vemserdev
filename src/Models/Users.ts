// src/models/Users.ts

import {DataTypes, Model} from 'sequelize';
import {sequelize} from '../config/database';



class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
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
    password:{
        type: DataTypes.STRING,
        

    }
}, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: true
});

export default User
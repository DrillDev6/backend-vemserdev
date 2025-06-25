// src/Models/Tokens.ts

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './Users';

export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    RESET_PASSWORD = 'reset_password',
    EMAIL_VERIFICATION = 'email_verification'
}

class Token extends Model {
    public id!: number;
    public user_id!: number;
    public token!: string;
    public type!: TokenType;
    public expires_at!: Date;
    public is_revoked!: boolean;
    public created_at!: Date;
    public updated_at!: Date;
    user: any;

    // Métodos úteis
    public isExpired(): boolean {
        return new Date() > this.expires_at;
    }

    public isValid(): boolean {
        return !this.is_revoked && !this.isExpired();
    }
}

Token.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM(...Object.values(TokenType)),
        allowNull: false,
        defaultValue: TokenType.ACCESS
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
    timestamps: true,
    indexes: [
        {
            fields: ['token']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['type']
        },
        {
            fields: ['expires_at']
        },
        {
            fields: ['is_revoked']
        }
    ]
});

// Definir associações
Token.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Token, { foreignKey: 'user_id', as: 'tokens' });

export default Token;
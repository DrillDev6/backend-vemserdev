import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import Car from './Cars';
import User from './Users';

class Reserve extends Model {
    public id!: number;
    public id_car!: number;
    public id_user!: number;
    public reserve_init!: Date;
    public reserve_end!: Date;
   
}

Reserve.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_car: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cars',
            key: 'id'
        }
    },
    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reserve_init: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reserve_end: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Reserve',
    tableName: 'reserves',
    timestamps: true,
});

// Definir associações
Reserve.belongsTo(Car, { foreignKey: 'id_car', as: 'car' });
Reserve.belongsTo(User, { foreignKey: 'id_user', as: 'user' });

export default Reserve;
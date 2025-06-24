import Reserve from "../Models/Reserves";
import Car from "../Models/Cars";
import User from "../Models/Users";
import { Op } from "sequelize";

export class ReserveService {

    async create(reserveData: {
        id_car: number;
        id_user: number;
        reserve_init: string;
        reserve_end: string;
    }) {
        // Validar se o carro existe
        const car = await Car.findByPk(reserveData.id_car);
        if (!car) {
            throw { status: 404, message: "Carro não encontrado" };
        }

        // Validar se o usuário existe
        const user = await User.findByPk(reserveData.id_user);
        if (!user) {
            throw { status: 404, message: "Usuário não encontrado" };
        }

        // Validar datas
        const initDate = new Date(reserveData.reserve_init);
        const endDate = new Date(reserveData.reserve_end);
        const now = new Date();

        if (initDate < now) {
            throw { status: 400, message: "Data de início não pode ser no passado" };
        }

        if (endDate <= initDate) {
            throw { status: 400, message: "Data final deve ser posterior à data inicial" };
        }

        // Verificar se há conflito de reservas para o mesmo carro
        const conflictingReserve = await Reserve.findOne({
            where: {
                id_car: reserveData.id_car,
                [Op.or]: [
                    // Nova reserva começa durante uma reserva existente
                    {
                        reserve_init: {
                            [Op.between]: [initDate, endDate]
                        }
                    },
                    // Nova reserva termina durante uma reserva existente
                    {
                        reserve_end: {
                            [Op.between]: [initDate, endDate]
                        }
                    },
                    // Nova reserva engloba completamente uma reserva existente
                    {
                        [Op.and]: [
                            { reserve_init: { [Op.gte]: initDate } },
                            { reserve_end: { [Op.lte]: endDate } }
                        ]
                    },
                    // Reserva existente engloba completamente a nova reserva
                    {
                        [Op.and]: [
                            { reserve_init: { [Op.lte]: initDate } },
                            { reserve_end: { [Op.gte]: endDate } }
                        ]
                    }
                ]
            }
        });

        if (conflictingReserve) {
            throw { status: 409, message: "Carro já está reservado neste período" };
        }

        // Criar a reserva
        const createdReserve = await Reserve.create({
            id_car: reserveData.id_car,
            id_user: reserveData.id_user,
            reserve_init: initDate,
            reserve_end: endDate
        });

        return Reserve.findByPk(createdReserve.id, {
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ]
        });
    }

    async getReserve(id: string) {
        const reserve = await Reserve.findByPk(id, {
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ]
        });
        
        if (!reserve) {
            throw { status: 404, message: "Reserva não encontrada" };
        }
        
        return reserve;
    }

    async getAllReserves() {
        return Reserve.findAll({
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ],
            order: [['reserve_init', 'ASC']]
        });
    }

    async getReservesByUser(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: "Usuário não encontrado" };
        }

        return Reserve.findAll({
            where: { id_user: userId },
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ],
            order: [['reserve_init', 'ASC']]
        });
    }

    async getReservesByCar(carId: number) {
        const car = await Car.findByPk(carId);
        if (!car) {
            throw { status: 404, message: "Carro não encontrado" };
        }

        return Reserve.findAll({
            where: { id_car: carId },
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ],
            order: [['reserve_init', 'ASC']]
        });
    }

    async update(id: string, reserveData: Partial<{
        id_car: number;
        id_user: number;
        reserve_init: string;
        reserve_end: string;
    }>) {
        const reserve = await Reserve.findByPk(id);
        if (!reserve) {
            throw { status: 404, message: "Reserva não encontrada" };
        }

        // Validar se carro existe (se está sendo alterado)
        if (reserveData.id_car) {
            const car = await Car.findByPk(reserveData.id_car);
            if (!car) {
                throw { status: 404, message: "Carro não encontrado" };
            }
        }

        // Validar se usuário existe (se está sendo alterado)
        if (reserveData.id_user) {
            const user = await User.findByPk(reserveData.id_user);
            if (!user) {
                throw { status: 404, message: "Usuário não encontrado" };
            }
        }

        // Se está tentando alterar as datas, validar
        if (reserveData.reserve_init || reserveData.reserve_end) {
            const initDate = reserveData.reserve_init ? new Date(reserveData.reserve_init) : reserve.reserve_init;
            const endDate = reserveData.reserve_end ? new Date(reserveData.reserve_end) : reserve.reserve_end;

            if (endDate <= initDate) {
                throw { status: 400, message: "Data final deve ser posterior à data inicial" };
            }

            // Verificar conflitos (excluindo a própria reserva)
            const conflictingReserve = await Reserve.findOne({
                where: {
                    id: { [Op.ne]: id },
                    id_car: reserveData.id_car || reserve.id_car,
                    [Op.or]: [
                        {
                            reserve_init: {
                                [Op.between]: [initDate, endDate]
                            }
                        },
                        {
                            reserve_end: {
                                [Op.between]: [initDate, endDate]
                            }
                        },
                        {
                            [Op.and]: [
                                { reserve_init: { [Op.gte]: initDate } },
                                { reserve_end: { [Op.lte]: endDate } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { reserve_init: { [Op.lte]: initDate } },
                                { reserve_end: { [Op.gte]: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (conflictingReserve) {
                throw { status: 409, message: "Carro já está reservado neste período" };
            }
        }

        await reserve.update(reserveData);
        
        return Reserve.findByPk(id, {
            include: [
                { model: Car, as: 'car' },
                { model: User, as: 'user' }
            ]
        });
    }

    async delete(id: string) {
        const reserve = await Reserve.findByPk(id);
        if (!reserve) {
            throw { status: 404, message: "Reserva não encontrada" };
        }

        await reserve.destroy();
    }
}

export default new ReserveService();
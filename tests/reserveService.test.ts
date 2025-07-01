jest.mock('../src/Models/Reserves', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn()
    }
}));
jest.mock('../src/Models/Cars', () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn()
    }
}));
jest.mock('../src/Models/Users', () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn()
    }
}));
import { ReserveService } from '../src/Services/reserveService';
import Reserve from '../src/Models/Reserves';
import Car from '../src/Models/Cars';
import User from '../src/Models/Users';
import { Op } from 'sequelize';
describe('ReserveService', () => {
    let service: ReserveService;
    let mockCar: any;
    let mockUser: any;
    let mockReserve: any;
    beforeEach(() => {
        service = new ReserveService();
        mockCar = { id: 1 };
        mockUser = { id: 1 };
        mockReserve = { id: 1, id_car: 1, id_user: 1, reserve_init: '2025-07-02', reserve_end: '2025-07-03' };
        jest.clearAllMocks();
    });
    describe('create', () => {
        it('should create a new reserve', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            Reserve.findOne = jest.fn().mockResolvedValue(null);
            Reserve.create = jest.fn().mockResolvedValue({ id: 1 });
            Reserve.findByPk = jest.fn().mockResolvedValue(mockReserve);
            const result = await service.create({
                id_car: 1,
                id_user: 1,
                reserve_init: '2025-07-02',
                reserve_end: '2025-07-03'
            });
            expect(result).toEqual(mockReserve);
        });
        it('should throw if car not found', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.create({ id_car: 1, id_user: 1, reserve_init: '2025-07-02', reserve_end: '2025-07-03' })).rejects.toEqual({ status: 404, message: 'Carro não encontrado' });
        });
        it('should throw if user not found', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            User.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.create({ id_car: 1, id_user: 1, reserve_init: '2025-07-02', reserve_end: '2025-07-03' })).rejects.toEqual({ status: 404, message: 'Usuário não encontrado' });
        });
        it('should throw if init date is in the past', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            await expect(service.create({ id_car: 1, id_user: 1, reserve_init: '2020-01-01', reserve_end: '2025-07-03' })).rejects.toEqual({ status: 400, message: 'Data de início não pode ser no passado' });
        });
        it('should throw if end date is before init date', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            await expect(service.create({ id_car: 1, id_user: 1, reserve_init: '2025-07-03', reserve_end: '2025-07-02' })).rejects.toEqual({ status: 400, message: 'Data final deve ser posterior à data inicial' });
        });
        it('should throw if there is a conflicting reserve', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            Reserve.findOne = jest.fn().mockResolvedValue({});
            await expect(service.create({ id_car: 1, id_user: 1, reserve_init: '2025-07-02', reserve_end: '2025-07-03' })).rejects.toEqual({ status: 409, message: 'Carro já está reservado neste período' });
        });
    });
});

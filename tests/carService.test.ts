jest.mock('../src/Models/Cars', () => ({
    __esModule: true,
    default: {
        count: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn()
    }
}));

import { carServices } from '../src/Services/carService';
import Car from '../src/Models/Cars';

describe('carServices', () => {
    let service: carServices;
    let mockCar: any;

    beforeEach(() => {
        service = new carServices();
        mockCar = { id: 1, brand: 'Brand', model: 'Model', year: 2020, plate: 'ABC1234', chassi: 'CHASSI123' };
        jest.clearAllMocks();
    });

    describe('registry', () => {
        it('should create and return a new car', async () => {
            Car.count = jest.fn().mockResolvedValue(0);
            Car.create = jest.fn().mockResolvedValue({ id: 1 });
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            const result = await service.registry(mockCar);
            expect(result).toEqual(mockCar);
        });
        it('should throw if car already exists', async () => {
            Car.count = jest.fn().mockResolvedValue(1);
            await expect(service.registry(mockCar)).rejects.toEqual({ status: 400, message: 'Car already exists' });
        });
    });

    describe('getCars', () => {
        it('should return car by id', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            const result = await service.getCars(1);
            expect(result).toEqual(mockCar);
        });
        it('should throw if car not found', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.getCars(1)).rejects.toEqual({ status: 404, message: 'Veichle not found' });
        });
    });

    describe('update', () => {
        it('should update and return car', async () => {
            const updatedCar = { ...mockCar, model: 'NewModel' };
            Car.findByPk = jest.fn().mockResolvedValue({ ...mockCar, update: jest.fn().mockResolvedValue(updatedCar) });
            const result = await service.update(1, { model: 'NewModel' });
            expect(result).toEqual(updatedCar);
        });
        it('should throw if car not found', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.update(1, { model: 'NewModel' })).rejects.toEqual({ status: 404, message: 'Not found' });
        });
        it('should throw if new plate already exists', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(mockCar);
            Car.findOne = jest.fn().mockResolvedValue({});
            await expect(service.update(1, { plate: 'NEWPLATE' })).rejects.toEqual({ status: 400, message: 'Car already exists' });
        });
    });

    describe('delete', () => {
        it('should delete car', async () => {
            Car.findByPk = jest.fn().mockResolvedValue({ ...mockCar, destroy: jest.fn().mockResolvedValue(undefined) });
            await expect(service.delete(1)).resolves.toBeUndefined();
        });
        it('should throw if car not found', async () => {
            Car.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.delete(1)).rejects.toEqual({ status: 404, message: 'Your search dont exists' });
        });
    });
});


import request from 'supertest';
import express from 'express';
import carController from '../../src/Controllers/carController';

describe('CarController', () => {
    let app: express.Express;
    let carServiceMock: any;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        carServiceMock = {
            registry: jest.fn(),
            getCars: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        carController.carServices = carServiceMock;
        app.post('/cars/registry', carController.registryCar.bind(carController));
        app.get('/cars/:id', carController.getCarById.bind(carController));
        app.patch('/update-car/:id', carController.updateCar.bind(carController));
        app.delete('/delete-car/:id', carController.deleteCar.bind(carController));
    });

    afterEach(() => jest.clearAllMocks());

    it('should register a car', async () => {
        carServiceMock.registry.mockResolvedValue({ id: 1, model: 'A' });
        const res = await request(app).post('/cars/registry').send({ model: 'A' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 1, model: 'A' });
    });

    it('should get car by id', async () => {
        carServiceMock.getCars.mockResolvedValue({ id: 1, model: 'A' });
        const res = await request(app).get('/cars/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, model: 'A' });
    });

    it('should update a car', async () => {
        carServiceMock.update.mockResolvedValue(undefined);
        const res = await request(app).patch('/update-car/1').send({ model: 'C' });
        expect(res.status).toBe(204);
    });

    it('should delete a car', async () => {
        carServiceMock.delete.mockResolvedValue(undefined);
        const res = await request(app).delete('/delete-car/1');
        expect(res.status).toBe(204);
    });
});

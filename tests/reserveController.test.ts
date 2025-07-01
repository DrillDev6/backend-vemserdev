import request from 'supertest';
import express from 'express';
import reserveController from '../src/Controllers/reserveController';

describe('ReserveController', () => {
    let app: express.Express;
    let reserveServiceMock: any;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        reserveServiceMock = {
            create: jest.fn(),
            getReserve: jest.fn(),
            getAllReserves: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        reserveController.reserveService = reserveServiceMock;
        app.post('/reserves', reserveController.createReserve.bind(reserveController));
        app.get('/reserves/:id', reserveController.getReserveById.bind(reserveController));
        app.get('/reserves', reserveController.getAllReserves.bind(reserveController));
        app.patch('/reserves/:id', reserveController.updateReserve.bind(reserveController));
        app.delete('/reserves/:id', reserveController.deleteReserve.bind(reserveController));
    });

    afterEach(() => jest.clearAllMocks());

    it('should create a reserve', async () => {
        reserveServiceMock.create.mockResolvedValue({ id: 1, carId: 2 });
        const res = await request(app).post('/reserves').send({ carId: 2 });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ id: 1, carId: 2 });
    });

    it('should get reserve by id', async () => {
        reserveServiceMock.getReserve.mockResolvedValue({ id: 1, carId: 2 });
        const res = await request(app).get('/reserves/1');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual({ id: 1, carId: 2 });
    });

    it('should get all reserves', async () => {
        reserveServiceMock.getAllReserves.mockResolvedValue([{ id: 1 }, { id: 2 }]);
        const res = await request(app).get('/reserves');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should update a reserve', async () => {
        reserveServiceMock.update.mockResolvedValue(undefined);
        const res = await request(app).patch('/reserves/1').send({ carId: 3 });
        expect(res.status).toBe(204);
    });

    it('should delete a reserve', async () => {
        reserveServiceMock.delete.mockResolvedValue(undefined);
        const res = await request(app).delete('/reserves/1');
        expect(res.status).toBe(204);
    });
});

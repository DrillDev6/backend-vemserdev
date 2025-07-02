import request from 'supertest';
import express from 'express';
import userController from '../../src/Controllers/userController';

describe('UserController', () => {
    let app: express.Express;
    let userServiceMock: any;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        userServiceMock = {
            create: jest.fn(),
            getUser: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        userController.userService = userServiceMock;
        app.post('/users', userController.createUser.bind(userController));
        app.get('/users/:email', userController.getUserByName.bind(userController));
        app.patch('/users/:id', userController.updateUser.bind(userController));
        app.delete('/users/:id', userController.deleteUser.bind(userController));
    });

    afterEach(() => jest.clearAllMocks());

    it('should create a user', async () => {
        userServiceMock.create.mockResolvedValue({ id: 1, email: 'test@example.com' });
        const res = await request(app).post('/users').send({ email: 'test@example.com' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should get user by email', async () => {
        userServiceMock.getUser.mockResolvedValue({ id: 1, email: 'test@example.com' });
        const res = await request(app).get('/users/test@example.com');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should update a user', async () => {
        userServiceMock.update.mockResolvedValue(undefined);
        const res = await request(app).patch('/users/1').send({ name: 'New Name' });
        expect(res.status).toBe(204);
    });

    it('should delete a user', async () => {
        userServiceMock.delete.mockResolvedValue(undefined);
        const res = await request(app).delete('/users/1');
        expect(res.status).toBe(204);
    });
});

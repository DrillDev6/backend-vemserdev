import request from 'supertest';
import express from 'express';
import AuthController from '../../src/Controllers/authController';

describe('AuthController', () => {
    let app: express.Express;
    let authServiceMock: any;
    let controller: any;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        authServiceMock = {
            login: jest.fn().mockResolvedValue({ accessToken: 'token', user: { id: 1 } }),
            refreshToken: jest.fn().mockResolvedValue({ accessToken: 'newtoken' }),
            logout: jest.fn().mockResolvedValue({}),
            logoutAll: jest.fn().mockResolvedValue({}),
            requestPasswordReset: jest.fn().mockResolvedValue({}),
            resetPassword: jest.fn().mockResolvedValue({}),
        };
        controller = AuthController;
        controller.authService = authServiceMock;
        app.post('/auth/login', (req, res) => controller.login(req, res));
        app.post('/auth/refresh', (req, res) => controller.refreshToken(req, res));
        app.post('/auth/logout', (req, res) => controller.logout(req, res));
        app.post('/auth/logout-all', (req, res, next) => { (req as any).userId = 1; next(); }, (req, res) => controller.logoutAll(req, res));
        app.post('/auth/forgot-password', (req, res) => controller.forgotPassword(req, res));
        app.post('/auth/reset-password', (req, res) => controller.resetPassword(req, res));
    });

    afterEach(() => jest.clearAllMocks());

    it('should login', async () => {
        const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: '123456' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should refresh token', async () => {
        const res = await request(app).post('/auth/refresh').send({ refreshToken: 'rtok' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });

    it('should logout', async () => {
        const res = await request(app).post('/auth/logout').set('Authorization', 'Bearer token');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should logout all', async () => {
        const res = await request(app).post('/auth/logout-all');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should request password reset', async () => {
        const res = await request(app).post('/auth/forgot-password').send({ email: 'a@b.com' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should reset password', async () => {
        const res = await request(app).post('/auth/reset-password').send({ token: 't', newPassword: '123456' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

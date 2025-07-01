import request from 'supertest';
import express from 'express';
import tokenController from '../src/Controllers/tokenController';

describe('TokenController', () => {
    let app: express.Express;
    let tokenServiceMock: any;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // Patch controller to use mock service
        tokenServiceMock = {
            generatePasswordResetToken: jest.fn(),
            validatePasswordResetToken: jest.fn(),
            revokeToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
            getUserActiveTokens: jest.fn(),
        };
        // Patch the controller's tokenService instance
        tokenController.tokenService = tokenServiceMock;
        app.post('/token/reset', tokenController.generatePasswordResetToken.bind(tokenController));
        app.post('/token/validate', tokenController.validatePasswordResetToken.bind(tokenController));
        app.post('/token/revoke', tokenController.revokeToken.bind(tokenController));
        app.post('/token/revokeAll', tokenController.revokeAllUserTokens.bind(tokenController));
        app.get('/token/active/:userId', tokenController.getUserActiveTokens.bind(tokenController));
    });

    afterEach(() => jest.clearAllMocks());

    it('should generate password reset token', async () => {
        tokenServiceMock.generatePasswordResetToken.mockResolvedValue('mockToken');
        const res = await request(app)
            .post('/token/reset')
            .send({ email: 'test@example.com' });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ token: 'mockToken' });
        expect(tokenServiceMock.generatePasswordResetToken).toHaveBeenCalledWith('test@example.com');
    });

    it('should validate password reset token', async () => {
        tokenServiceMock.validatePasswordResetToken.mockResolvedValue({ id: 1, email: 'test@example.com' });
        const res = await request(app)
            .post('/token/validate')
            .send({ token: 'mockToken' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ user: { id: 1, email: 'test@example.com' } });
        expect(tokenServiceMock.validatePasswordResetToken).toHaveBeenCalledWith('mockToken');
    });

    it('should revoke a token', async () => {
        tokenServiceMock.revokeToken.mockResolvedValue(undefined);
        const res = await request(app)
            .post('/token/revoke')
            .send({ token: 'mockToken' });
        expect(res.status).toBe(204);
        expect(tokenServiceMock.revokeToken).toHaveBeenCalledWith('mockToken');
    });

    it('should revoke all user tokens', async () => {
        tokenServiceMock.revokeAllUserTokens.mockResolvedValue(undefined);
        const res = await request(app)
            .post('/token/revokeAll')
            .send({ userId: 1 });
        expect(res.status).toBe(204);
        expect(tokenServiceMock.revokeAllUserTokens).toHaveBeenCalledWith(1);
    });

    it('should get user active tokens', async () => {
        tokenServiceMock.getUserActiveTokens.mockResolvedValue([{ token: 'abc' }, { token: 'def' }]);
        const res = await request(app)
            .get('/token/active/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ token: 'abc' }, { token: 'def' }]);
        expect(tokenServiceMock.getUserActiveTokens).toHaveBeenCalledWith(1);
    });
});

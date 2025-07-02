// Mock environment variables before importing the service
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

jest.mock('../../src/Models/Users', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
        hasMany: jest.fn()
    }
}));

jest.mock('bcryptjs', () => ({
    __esModule: true,
    default: {
        compare: jest.fn()
    }
}));

jest.mock('../../src/Services/tokenService', () => ({
    __esModule: true,
    default: {
        generateTokenPair: jest.fn(),
        refreshToken: jest.fn(),
        revokeToken: jest.fn(),
        revokeAllUserTokens: jest.fn()
    }
}));

import { AuthService } from '../../src/Services/authService';
import User from '../../src/Models/Users';
import bcrypt from 'bcryptjs';
import tokenService from '../../src/Services/tokenService';
import { BadRequestError } from '../../src/Models/exceptions';

describe('AuthService', () => {
    let authService: AuthService;
    let mockUser: any;

    beforeEach(() => {
        authService = new AuthService();
        mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedpassword'
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login and return tokens and user info', async () => {
            User.findOne = jest.fn().mockResolvedValue(mockUser);
            (bcrypt.compare as any) = jest.fn().mockResolvedValue(true);
            (tokenService.generateTokenPair as any) = jest.fn().mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh', expiresIn: 123, tokenType: 'Bearer' });

            const result = await authService.login('test@example.com', 'password');
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
            expect(result.user).toEqual({ id: mockUser.id, name: mockUser.name, email: mockUser.email });
        });

        it('should throw BadRequestError if user not found', async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            await expect(authService.login('notfound@example.com', 'password')).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError if password is invalid', async () => {
            User.findOne = jest.fn().mockResolvedValue(mockUser);
            (bcrypt.compare as any) = jest.fn().mockResolvedValue(false);
            await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(BadRequestError);
        });
    });

    describe('refreshToken', () => {
        it('should call tokenService.refreshToken', async () => {
            (tokenService.refreshToken as any) = jest.fn().mockResolvedValue('newtoken');
            const result = await authService.refreshToken('sometoken');
            expect(tokenService.refreshToken).toHaveBeenCalledWith('sometoken');
            expect(result).toBe('newtoken');
        });
    });

    describe('logout', () => {
        it('should revoke the token and return message', async () => {
            (tokenService.revokeToken as any) = jest.fn().mockResolvedValue(undefined);
            const result = await authService.logout('sometoken');
            expect(tokenService.revokeToken).toHaveBeenCalledWith('sometoken');
            expect(result).toEqual({ message: 'Logout realizado com sucesso' });
        });
    });

    describe('logoutAll', () => {
        it('should revoke all user tokens and return message', async () => {
            (tokenService.revokeAllUserTokens as any) = jest.fn().mockResolvedValue(undefined);
            const result = await authService.logoutAll(1);
            expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(1);
            expect(result).toEqual({ message: 'Logout realizado em todos os dispositivos' });
        });
    });
});

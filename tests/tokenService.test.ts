
// Mock the environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-secret';

// Mock the entire Token and User modules to prevent Sequelize associations
jest.mock('../src/Models/Tokens', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  TokenType: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
  },
}));
jest.mock('../src/Models/Users', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

import { TokenService } from '../src/Services/tokenService';
import Token, { TokenType } from '../src/Models/Tokens';
import User from '../src/Models/Users';
import jwt from 'jsonwebtoken';
import { BadRequestError, NotFoundError } from '../src/Models/exceptions';

describe('TokenService', () => {
    let tokenService: TokenService;
    let mockUser: any;

    beforeEach(() => {
        tokenService = new TokenService();
        mockUser = {
            id: 1,
            email: 'test@example.com'
        };

        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock the User model
        (User.findByPk as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
        (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockUser);

        // Mock the Token model
        (Token.create as jest.Mock) = jest.fn().mockResolvedValue({
            id: 1,
            user_id: mockUser.id,
            token: 'mock-token',
            type: TokenType.ACCESS,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
            is_revoked: false
        });
    });

    describe('generateTokenPair', () => {
        it('should generate access and refresh tokens for valid user', async () => {
            const result = await tokenService.generateTokenPair(mockUser.id);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('expiresIn', 24 * 60 * 60);
            expect(result).toHaveProperty('tokenType', 'Bearer');

            expect(Token.create).toHaveBeenCalledTimes(2);
        });

        it('should throw NotFoundError for invalid user', async () => {
            (User.findByPk as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.generateTokenPair(999))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('refreshToken', () => {
        it('should refresh token pair when valid refresh token is provided', async () => {
            const mockToken = {
                token: 'valid-refresh-token',
                type: TokenType.REFRESH,
                is_revoked: false,
                isValid: () => true,
                update: jest.fn(),
                user: mockUser
            };

            (Token.findOne as jest.Mock).mockResolvedValue(mockToken);
            jest.spyOn(jwt, 'verify').mockImplementation(() => ({ userId: mockUser.id }));

            const result = await tokenService.refreshToken('valid-refresh-token');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(mockToken.update).toHaveBeenCalledWith({ is_revoked: true });
        });

        it('should throw BadRequestError for invalid refresh token', async () => {
            (Token.findOne as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.refreshToken('invalid-token'))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('validateAccessToken', () => {
        it('should validate a valid access token', async () => {
            const mockToken = {
                token: 'valid-access-token',
                type: TokenType.ACCESS,
                is_revoked: false,
                isValid: () => true,
                user: mockUser
            };

            (Token.findOne as jest.Mock).mockResolvedValue(mockToken);
            jest.spyOn(jwt, 'verify').mockImplementation(() => ({ userId: mockUser.id, email: mockUser.email }));

            const result = await tokenService.validateAccessToken('valid-access-token');

            expect(result).toHaveProperty('userId', mockUser.id);
            expect(result).toHaveProperty('email', mockUser.email);
            expect(result).toHaveProperty('user', mockUser);
        });

        it('should throw BadRequestError for invalid access token', async () => {
            (Token.findOne as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.validateAccessToken('invalid-token'))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('generatePasswordResetToken', () => {
        it('should generate password reset token for valid email', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await tokenService.generatePasswordResetToken(mockUser.email);

            expect(result).toBeTruthy();
            expect(Token.create).toHaveBeenCalledWith(expect.objectContaining({
                user_id: mockUser.id,
                type: TokenType.RESET_PASSWORD
            }));
        });

        it('should throw NotFoundError for invalid email', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.generatePasswordResetToken('invalid@email.com'))
                .rejects
                .toThrow(NotFoundError);
        });
    });

    describe('validatePasswordResetToken', () => {
        it('should validate a valid password reset token', async () => {
            const mockToken = {
                token: 'valid-reset-token',
                type: TokenType.RESET_PASSWORD,
                is_revoked: false,
                isValid: () => true,
                user: mockUser
            };

            (Token.findOne as jest.Mock).mockResolvedValue(mockToken);
            jest.spyOn(jwt, 'verify').mockImplementation(() => ({ userId: mockUser.id }));

            const result = await tokenService.validatePasswordResetToken('valid-reset-token');
            expect(result).toEqual(mockUser);
        });

        it('should throw BadRequestError for invalid reset token', async () => {
            (Token.findOne as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.validatePasswordResetToken('invalid-token'))
                .rejects
                .toThrow(BadRequestError);
        });
    });

    describe('cleanExpiredTokens', () => {
        it('should remove expired and revoked tokens', async () => {
            const mockDeletedCount = 5;
            (Token.destroy as jest.Mock) = jest.fn().mockResolvedValue(mockDeletedCount);

            const result = await tokenService.cleanExpiredTokens();
            expect(result).toBe(mockDeletedCount);
        });
    });

    describe('getUserActiveTokens', () => {
        it('should return active tokens for a user', async () => {
            const mockTokens = [
                { id: 1, token: 'token1' },
                { id: 2, token: 'token2' }
            ];
            (Token.findAll as jest.Mock) = jest.fn().mockResolvedValue(mockTokens);

            const result = await tokenService.getUserActiveTokens(mockUser.id);
            expect(result).toEqual(mockTokens);
        });
    });

    describe('revokeToken', () => {
        it('should revoke a specific token', async () => {
            const mockToken = {
                token: 'token-to-revoke',
                update: jest.fn()
            };
            (Token.findOne as jest.Mock).mockResolvedValue(mockToken);

            await tokenService.revokeToken('token-to-revoke');
            expect(mockToken.update).toHaveBeenCalledWith({ is_revoked: true });
        });
    });

    describe('revokeAllUserTokens', () => {
        it('should revoke all tokens for a user', async () => {
            (Token.update as jest.Mock) = jest.fn().mockResolvedValue([1]);

            await tokenService.revokeAllUserTokens(mockUser.id);
            expect(Token.update).toHaveBeenCalledWith(
                { is_revoked: true },
                expect.any(Object)
            );
        });
    });
});

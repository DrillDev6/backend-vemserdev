jest.mock('../../src/Models/Users', () => ({
    __esModule: true,
    default: {
        count: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn()
    }
}));

import { userService } from '../../src/Services/userService';
import User from '../../src/Models/Users';

describe('userService', () => {
    let service: userService;
    let mockUser: any;

    beforeEach(() => {
        service = new userService();
        mockUser = { id: 1, name: 'Test', email: 'test@example.com', password: 'pass' };
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create and return a new user', async () => {
            User.count = jest.fn().mockResolvedValue(0);
            User.create = jest.fn().mockResolvedValue({ id: 1 });
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            const result = await service.create(mockUser);
            expect(result).toEqual(mockUser);
        });
        it('should throw if user already exists', async () => {
            User.count = jest.fn().mockResolvedValue(1);
            await expect(service.create(mockUser)).rejects.toEqual({ status: 400, message: 'User already exists' });
        });
    });

    describe('getUser', () => {
        it('should return user by email', async () => {
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            const result = await service.getUser('test@example.com');
            expect(result).toEqual(mockUser);
        });
        it('should throw if user not found', async () => {
            User.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.getUser('notfound@example.com')).rejects.toEqual({ status: 404, message: 'User not found' });
        });
    });

    describe('update', () => {
        it('should update and return user', async () => {
            const updatedUser = { ...mockUser, name: 'NewName' };
            User.findByPk = jest.fn().mockResolvedValue({ ...mockUser, update: jest.fn().mockResolvedValue(updatedUser) });
            const result = await service.update(1, { name: 'NewName' });
            expect(result).toEqual(updatedUser);
        });
        it('should throw if user not found', async () => {
            User.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.update(1, { name: 'NewName' })).rejects.toEqual({ status: 404, message: 'User not Found' });
        });
        it('should throw if new email already exists', async () => {
            User.findByPk = jest.fn().mockResolvedValue(mockUser);
            User.findOne = jest.fn().mockResolvedValue({});
            await expect(service.update(1, { email: 'new@email.com' })).rejects.toEqual({ status: 400, message: 'User already exists' });
        });
    });

    describe('delete', () => {
        it('should delete user', async () => {
            User.findByPk = jest.fn().mockResolvedValue({ ...mockUser, destroy: jest.fn().mockResolvedValue(undefined) });
            await expect(service.delete(1)).resolves.toBeUndefined();
        });
        it('should throw if user not found', async () => {
            User.findByPk = jest.fn().mockResolvedValue(null);
            await expect(service.delete(1)).rejects.toEqual({ status: 404, message: 'User not found' });
        });
    });
});

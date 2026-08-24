import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getUser', () => {
    it('Should return a user, if it exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Caio',
        email: 'caio@example.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getUser('user-123');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('Should throw NotFoundException error if user doesnt exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.getUser('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUser('invalid-id')).rejects.toThrow(
        'User not found.',
      );
    });
  });

  describe('getUserByEmail', () => {
    it('Should return a user with the email, if it exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Caio',
        email: 'caio@email.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('caio@email.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'caio@email.com' },
      });
    });

    it('Should throw NotFoundException if email doesnt exist', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Caio',
        email: 'caio@email.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserByEmail('email@email.com')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserByEmail('email@email.com')).rejects.toThrow(
        'User not found.',
      );
    });
  });

  describe('getAllUsers', () => {
    it('Should return all registered users', async () => {
      const mockUsers = [
        {
          id: 'user-123',
          name: 'Caio',
          email: 'caio@email.com',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('Should throw NotFoundException if no registered users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await expect(service.getAllUsers()).rejects.toThrow(NotFoundException);
      await expect(service.getAllUsers()).rejects.toThrow(
        'There are no registered users.',
      );
    });
  });

  describe('create', () => {
    it('Should create a new user', async () => {
      const mockUserDto = {
        name: 'Caio',
        email: 'caio@email.com',
        password: 'password@123',
        role: 'USER',
      };
      const mockCreatedUser = {
        ...mockUserDto,
        password: 'hashed-password-123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(mockUserDto);
      const { password, ...expectedResult } = mockCreatedUser;

      expect(result).toEqual(expectedResult);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUserDto,
          password: expect.any(String),
        },
      });
    });

    it('Should throw ConflictException if email already in use', async () => {
      const mockUserDto = {
        name: 'Caio',
        email: 'caio@email.com',
        password: 'password@123',
        role: 'USER',
      };
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'caio@email.com',
      });

      await expect(service.create(mockUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockUserDto)).rejects.toThrow(
        'Email already in use.',
      );
    });
  });

  describe('update', () => {
    it('Should update an existing user', async () => {
      const mockUserDto = {
        name: 'Caio',
        email: 'caio@email.com',
        password: 'password@123',
        role: 'USER',
      };

      const mockUpdatedUser = {
        id: 'user-123',
        ...mockUserDto,
        password: 'hashed-password-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update('user-123', mockUserDto);
      const { password, ...expectedResult } = mockUpdatedUser;

      expect(result).toEqual(expectedResult);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          ...mockUserDto,
          password: expect.any(String),
        },
      });
    });

    it('Should throw ConflictException if email already in use', async () => {
      const mockUserDto = {
        name: 'Caio',
        email: 'caio@email.com',
        password: 'password@123',
        role: 'USER',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'user-999',
        email: 'caio@email.com',
      });

      await expect(service.update('user-123', mockUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update('user-123', mockUserDto)).rejects.toThrow(
        'This e-mail is already in use.',
      );
    });
  });

  describe('delete', () => {
    it('Should delete an existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'caio@email.com',
      });
      mockPrismaService.user.delete.mockResolvedValue({
        id: 'user-123',
        email: 'caio@email.com',
      });

      const result = await service.delete('user-123');

      expect(result).toEqual({ message: 'User deleted with success.' });
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('Should throw NotFoundException if user doesnt exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('user-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete('user-123')).rejects.toThrow(
        'User not found.',
      );
    });
  });
});

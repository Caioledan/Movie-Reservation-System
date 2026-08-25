import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

const mockMovie = {
  id: 'some-uuid-string',
  title: 'Test Movie',
  description: 'Test Description',
  posterImage: 'http://test.com/poster.jpg',
  genre: 'Action',
  ageRating: '14',
  duration: 120,
  language: 'Portuguese',
  releaseDate: new Date('2023-01-01'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prismaServiceMock = {
  movie: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('MovieService', () => {
  let service: MovieService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMovie', () => {
    const createDto: CreateMovieDto = {
      title: 'Test Movie',
      description: 'Test Description',
      posterImage: 'http://test.com/poster.jpg',
      genre: 'Action',
      ageRating: '14',
      duration: 120,
      language: 'Portuguese',
      releaseDate: '2023-01-01T00:00:00.000Z',
    };

    it('should successfully create a movie', async () => {
      (prisma.movie.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.movie.create as jest.Mock).mockResolvedValue(mockMovie);

      const result = await service.createMovie(createDto);

      expect(prisma.movie.findFirst).toHaveBeenCalledWith({
        where: {
          title: createDto.title,
          releaseDate: createDto.releaseDate,
        },
      });
      expect(prisma.movie.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(mockMovie);
    });

    it('should throw ConflictException if movie already exists', async () => {
      (prisma.movie.findFirst as jest.Mock).mockResolvedValue(mockMovie);

      await expect(service.createMovie(createDto)).rejects.toThrow(ConflictException);
      expect(prisma.movie.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should successfully update a movie', async () => {
      const updateDto: UpdateMovieDto = { title: 'Updated Title' };
      const updatedMovie = { ...mockMovie, title: 'Updated Title' };

      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const result = await service.update(mockMovie.id, updateDto);

      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: mockMovie.id },
        data: updateDto,
      });
      expect(result).toEqual(updatedMovie);
    });
  });

  describe('delete', () => {
    it('should successfully delete a movie', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.movie.delete as jest.Mock).mockResolvedValue(mockMovie);

      const result = await service.delete(mockMovie.id);

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: mockMovie.id } });
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: mockMovie.id } });
      expect(result).toEqual({ message: 'Movie deleted with success' });
    });

    it('should throw NotFoundException if movie is not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('invalid-id')).rejects.toThrow(NotFoundException);
      expect(prisma.movie.delete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if delete operation fails', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.movie.delete as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.delete(mockMovie.id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getMovie', () => {
    it('should successfully return a movie', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const result = await service.getMovie(mockMovie.id);

      expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: mockMovie.id } });
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getMovie('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllMovies', () => {
    it('should return an array of movies ordered by releaseDate desc', async () => {
      const moviesList = [mockMovie];
      (prisma.movie.findMany as jest.Mock).mockResolvedValue(moviesList);

      const result = await service.getAllMovies();

      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        orderBy: { releaseDate: 'desc' },
      });
      expect(result).toEqual(moviesList);
    });
  });
});

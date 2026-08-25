import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) { }

  async createMovie(data: CreateMovieDto) {
    const movieExists = await this.prisma.movie.findFirst({
      where: {
        title: data.title,
        releaseDate: data.releaseDate,
      }
    });

    if (movieExists) {
      throw new ConflictException('Filme já está cadastrado no sistema.');
    }

    const newMovie = await this.prisma.movie.create({
      data: data,
    });

    return newMovie;
  }

  async update(movieId: string, data: UpdateMovieDto) {
    const updatedMovie = await this.prisma.movie.update({
      where: { id: movieId },
      data: data,
    });

    return updatedMovie;
  }

  async delete(movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found.')
    }

    try {
      await this.prisma.movie.delete({ where: { id: movieId } });
      return { message: 'Movie deleted with success' };
    }
    catch (error) {
      throw new InternalServerErrorException('Movie could not be deleted.');
    };
  }

  async getMovie(movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId }
    });

    if (!movie) {
      throw new NotFoundException('Movie not found.');
    }

    return movie;
  }

  async getAllMovies() {
    const movies = await this.prisma.movie.findMany({
      orderBy: {
        releaseDate: 'desc',
      }
    });

    return movies;
  }
}

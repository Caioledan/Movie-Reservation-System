import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post('create')
  async create(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.createMovie(createMovieDto);
  }


  @Get('get/:id')
  async getMovie(@Param('id') id: string) {
    return this.movieService.getMovie(id);
  }

  @Get('getall')
  async getAllMovies() {
    return this.movieService.getAllMovies();
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.movieService.delete(id);
  }

}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsUrl,
  IsDateString,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'The Matrix' })
  @IsNotEmpty({ message: 'Title is required.' })
  @IsString({ message: 'Title must be a string.' })
  title!: string;

  @ApiProperty({ example: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.' })
  @IsNotEmpty({ message: 'Description is required.' })
  @IsString({ message: 'Description must be a string.' })
  description!: string;

  @ApiProperty({ example: 'https://example.com/poster.jpg' })
  @IsNotEmpty({ message: 'Poster image is required.' })
  @IsUrl({}, { message: 'Poster image must be a valid URL.' })
  posterImage!: string;

  @ApiProperty({ example: 'Sci-Fi' })
  @IsNotEmpty({ message: 'Genre is required.' })
  @IsString({ message: 'Genre must be a string.' })
  genre!: string;

  @ApiProperty({ example: '14' })
  @IsNotEmpty({ message: 'Age rating is required.' })
  @IsString({ message: 'Age rating must be a string.' })
  ageRating!: string;

  @ApiProperty({ example: 136, description: 'Duration in minutes' })
  @IsNotEmpty({ message: 'Duration is required.' })
  @IsInt({ message: 'Duration must be an integer (minutes).' })
  duration!: number;

  @ApiProperty({ example: 'English' })
  @IsNotEmpty({ message: 'Language is required.' })
  @IsString({ message: 'Language must be a string.' })
  language!: string;

  @ApiProperty({ example: '1999-03-31T00:00:00.000Z' })
  @IsNotEmpty({ message: 'Release date is required.' })
  @IsDateString(
    {},
    { message: 'Release date must be a valid ISO 8601 date string.' },
  )
  releaseDate!: string;
}
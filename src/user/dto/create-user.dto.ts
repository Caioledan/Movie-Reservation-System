import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Caio Lemos',
    description: 'User complete name',
  })
  @IsString({ message: 'The name must be a valid text.' })
  @IsNotEmpty({ message: 'The name cannot be empty.' })
  name!: string;

  @IsEmail({}, { message: 'Provide a valid email.' })
  @IsNotEmpty({ message: 'The email addres is required.' })
  email!: string;

  @IsNotEmpty({ message: 'The password must not be empty.' })
  @MinLength(8, { message: 'The password must have at least 8 characteres.' })
  @IsString({ message: 'The password must be a valid text.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'The password must contain at least one capital letter, a lowercase, a number, and a special character.',
  })
  password!: string;
}

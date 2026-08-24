import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.update(
      req.user.id,
      updateUserDto,
    );

    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async delete(@Request() req: { user: { id: string } }) {
    return this.userService.delete(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Request() req: { user: { id: string } }) {
    return this.userService.getUser(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllUsers() {
    return this.userService.getAllUsers()
  }

  @UseGuards(JwtAuthGuard)
  @Get('email')
  async getUserByEmail(@Body() email: string) {
    return this.userService.getUserByEmail(email)
  }
}

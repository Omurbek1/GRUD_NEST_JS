import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Roles('public')
  findAll() {
    return this.usersService.findAllUsers();
  }

  // Get a user with favorites list
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Update a user (Authenticated)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: { userName: string; userNameDescription: string },
  ) {
    return this.usersService.update(
      id,
      updateUserDto.userName,
      updateUserDto.userNameDescription,
    );
  }

  // Delete a user (Authenticated)
  @Delete(':id')
  deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  //get favorites for a user
  // Add a favorite user (Authenticated)
  @Post(':id/favorite/:favoriteId')
  addFavorite(
    @Param('id') userId: number,
    @Param('favoriteId') favoriteUserId: number,
  ) {
    return this.usersService.addFavorite(userId, favoriteUserId);
  }

  // Get favorites for a user (Authenticated)
  @Get(':id/favorites')
  async findFavorites(@Param('id') userId: number) {
    // Проверяем, что пользователь запрашивает свой собственный список избранных
    return this.usersService.getFavorites(userId);
  }

  // Delete a favorite user (Authenticated)
  @Delete(':id/favorite/:favoriteId')
  deleteFavorite(
    @Param('id') userId: number,
    @Param('favoriteId') favoriteUserId: number,
  ) {
    return this.usersService.deleteFavorite(userId, favoriteUserId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-data')
  getAdminData(@Request() req) {
    return { message: 'Только для админов', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

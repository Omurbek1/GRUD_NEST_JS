import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  // Get all users with isFavorite  status
  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['favorites', 'favorites.favoriteUser'],
    });
  }

  // Get a user with favorites
  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['favorites', 'favorites.favoriteUser'],
    });
  }

  // Create a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }
  // Update a user result text fields
  async update(
    id: number,
    userName: string,
    userNameDescription: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.userName = userName;
    user.userNameDescription = userNameDescription;
    return await this.userRepository.save(user);
  }

  // Delete a user
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.favorites.length > 0) {
      throw new Error('Cannot delete user with favorites');
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }

  // Add a favorite user
  // Добавить пользователя в избранное
  async addFavorite(userId: number, favoriteUserId: number): Promise<Favorite> {
    // Проверка: нельзя добавить самого себя в избранное
    if (userId === favoriteUserId) {
      throw new BadRequestException('Нельзя добавить самого себя в избранное');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    if (!favoriteUser) {
      throw new NotFoundException(
        `Избранный пользователь с ID ${favoriteUserId} не найден`,
      );
    }

    // Проверка, если уже есть в избранных
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user, favoriteUser },
    });
    if (existingFavorite) {
      throw new BadRequestException('Пользователь уже добавлен в избранные');
    }

    // Создание новой записи в избранных
    const favorite = this.favoriteRepository.create({
      user,
      favoriteUser,
    });

    return this.favoriteRepository.save(favorite);
  }

  // Get favorites for a user
  async getFavorites(userId: number): Promise<Favorite[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
    }

    // Находим все избранные записи для пользователя с isFavorite = true
    return this.favoriteRepository.find({
      where: { user },
      relations: ['favoriteUser'], // Загружаем связанные данные о пользователе
    });
  }
  // Delete a favorite user
  async deleteFavorite(
    userId: number,
    favoriteUserId: number,
  ): Promise<{ message: string }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, favoriteUser: { id: favoriteUserId } },
    });
    if (!favorite) {
      throw new NotFoundException(
        `Пользователь с ID ${userId} не добавил в избранные пользователя с ID ${favoriteUserId}`,
      );
    }
    await this.favoriteRepository.remove(favorite);
    return {
      message: `Пользователь с ID ${favoriteUserId} удален из избранных`,
    };
  }

  // Get favorites for a user
}

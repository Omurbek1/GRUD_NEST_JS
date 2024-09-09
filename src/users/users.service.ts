import { Injectable } from '@nestjs/common';
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

  // Get all users
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
  // Update a user
  async update(
    id: number,
    userName: string,
    userNameDescription: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      user.userName = userName;
      user.userNameDescription = userNameDescription;
      return this.userRepository.save(user);
    }
    return null;
  }

  // Delete a user
  async deleteUser(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      await this.userRepository.remove(user);
    }
  }
  // Add a favorite user
  async addFavorite(userId: number, favoriteUserId: number): Promise<Favorite> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId },
    });

    if (!user || !favoriteUser) {
      throw new Error('User or Favorite User not found');
    }

    const favorite = this.favoriteRepository.create({
      user,
      favoriteUser,
    });

    return this.favoriteRepository.save(favorite);
  }

  // Get favorites for a user
  async findFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['favoriteUser'],
    });
  }
  // Delete a favorite user
  async deleteFavorite(
    userId: number,
    favoriteUserId: number,
  ): Promise<Favorite> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId },
    });
    if (user && favoriteUser) {
      const favorite = await this.favoriteRepository.findOne({
        where: { user, favoriteUser },
      });
      if (favorite) {
        return this.favoriteRepository.remove(favorite);
      }
    }
    return null;
  }

  // Get favorites for a user
}

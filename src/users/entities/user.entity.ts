import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Favorite } from './favorite.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userNameDescription: string;

  @OneToMany(() => Favorite, (favorite) => favorite.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  favorites: Favorite[];

  @Column({ default: false })
  isFavorite: boolean;
}

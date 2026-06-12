import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum PostVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity('posts')
@Index('IDX_POST_VISIBILITY_CREATED_AT', ['visibility', 'createdAt'])
@Index('IDX_POST_AUTHOR_CREATED_AT', ['authorId', 'createdAt'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  text!: string;

  @Column({ type: 'varchar', nullable: true, length: 2048 })
  imageUrl: string | null = null;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility = PostVisibility.PUBLIC;

  @Column()
  authorId!: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  author!: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @Column({ default: 0 })
  likeCount: number = 0;

  @Column({ default: 0 })
  commentCount: number = 0;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

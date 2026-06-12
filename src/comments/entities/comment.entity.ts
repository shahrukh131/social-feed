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
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
@Index('IDX_COMMENT_POST_CREATED_AT', ['postId', 'createdAt'])
@Index('IDX_COMMENT_PARENT_CREATED_AT', ['parentCommentId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @Column()
  authorId: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'varchar', nullable: true, length: 36 })
  parentCommentId: string | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentComment: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies!: Comment[];

  @Column('text')
  body: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  replyCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum LikeTargetType {
  POST = 'post',
  COMMENT = 'comment',
}

@Entity('likes')
@Index('IDX_LIKE_TARGET', ['targetType', 'targetId'])
@Index('UQ_LIKE_USER_TARGET', ['userId', 'targetType', 'targetId'], {
  unique: true,
})
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: LikeTargetType,
  })
  targetType!: LikeTargetType;

  @Column()
  targetId!: string;

  @Column()
  actorDisplayName!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

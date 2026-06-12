import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesModule } from '../likes/likes.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { Comment } from './entities/comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    LikesModule,
    PostsModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}

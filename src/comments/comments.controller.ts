import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(postId, user.sub, createCommentDto);
  }

  @Get('posts/:postId/comments')
  listPostComments(@Param('postId') postId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.listPostComments(postId, user.sub);
  }

  @Post('comments/:commentId/replies')
  createReply(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createReply(commentId, user.sub, createCommentDto);
  }

  @Post('comments/:commentId/like')
  likeComment(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.likeComment(commentId, user.sub);
  }

  @Delete('comments/:commentId/like')
  unlikeComment(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.unlikeComment(commentId, user.sub);
  }

  @Get('comments/:commentId/likes')
  listCommentLikes(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.listCommentLikes(commentId, user.sub);
  }
}

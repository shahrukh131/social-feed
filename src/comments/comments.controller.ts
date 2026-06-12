import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CommentResponseDto,
  LikeListItemDto,
} from '../common/swagger/api-doc.models';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Create a top-level comment on a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiForbiddenResponse({ description: 'Post is not accessible' })
  createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(postId, user.sub, createCommentDto);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'List comments and replies for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiOkResponse({ type: CommentResponseDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Post is not accessible' })
  listPostComments(@Param('postId') postId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.listPostComments(postId, user.sub);
  }

  @Post('comments/:commentId/replies')
  @ApiOperation({ summary: 'Create a reply to a comment' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiForbiddenResponse({ description: 'Comment or parent post is not accessible' })
  createReply(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtUser,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createReply(commentId, user.sub, createCommentDto);
  }

  @Post('comments/:commentId/like')
  @ApiOperation({ summary: 'Like a comment or reply' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiOkResponse({ type: CommentResponseDto })
  @ApiForbiddenResponse({ description: 'Comment or parent post is not accessible' })
  likeComment(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.likeComment(commentId, user.sub);
  }

  @Delete('comments/:commentId/like')
  @ApiOperation({ summary: 'Unlike a comment or reply' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiOkResponse({ type: CommentResponseDto })
  @ApiForbiddenResponse({ description: 'Comment or parent post is not accessible' })
  unlikeComment(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.unlikeComment(commentId, user.sub);
  }

  @Get('comments/:commentId/likes')
  @ApiOperation({ summary: 'List users who liked a comment or reply' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiOkResponse({ type: LikeListItemDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Comment or parent post is not accessible' })
  listCommentLikes(@Param('commentId') commentId: string, @CurrentUser() user: JwtUser) {
    return this.commentsService.listCommentLikes(commentId, user.sub);
  }
}

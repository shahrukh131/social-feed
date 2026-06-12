import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesService } from '../likes/likes.service';
import { LikeTargetType } from '../likes/entities/like.entity';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly usersService: UsersService,
  ) {}

  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    await this.postsService.findAccessiblePostOrFail(postId, userId);

    const comment = this.commentsRepository.create({
      postId,
      authorId: userId,
      parentCommentId: null,
      body: dto.body.trim(),
    });

    const savedComment = await this.commentsRepository.save(comment);
    await this.postsService.incrementCommentCount(postId);

    return this.getCommentById(savedComment.id, userId);
  }

  async createReply(commentId: string, userId: string, dto: CreateCommentDto) {
    const parentComment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    await this.postsService.findAccessiblePostOrFail(parentComment.postId, userId);

    const reply = this.commentsRepository.create({
      postId: parentComment.postId,
      authorId: userId,
      parentCommentId: parentComment.id,
      body: dto.body.trim(),
    });

    const savedReply = await this.commentsRepository.save(reply);
    await this.commentsRepository.increment({ id: parentComment.id }, 'replyCount', 1);
    await this.postsService.incrementCommentCount(parentComment.postId);

    return this.getCommentById(savedReply.id, userId);
  }

  async listPostComments(postId: string, userId: string) {
    await this.postsService.findAccessiblePostOrFail(postId, userId);

    const comments = await this.commentsRepository.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });

    const likedCommentIds = await this.likesService.getLikedTargetIds(
      userId,
      LikeTargetType.COMMENT,
      comments.map((comment) => comment.id),
    );

    const topLevelComments = comments.filter((comment) => !comment.parentCommentId);
    const repliesByParentId = new Map<string, Comment[]>();

    for (const comment of comments) {
      if (!comment.parentCommentId) {
        continue;
      }

      const existingReplies = repliesByParentId.get(comment.parentCommentId) ?? [];
      existingReplies.push(comment);
      repliesByParentId.set(comment.parentCommentId, existingReplies);
    }

    return topLevelComments.map((comment) =>
      this.serializeComment(
        comment,
        likedCommentIds.has(comment.id),
        (repliesByParentId.get(comment.id) ?? []).map((reply) =>
          this.serializeComment(reply, likedCommentIds.has(reply.id)),
        ),
      ),
    );
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.getAccessibleCommentOrFail(commentId, userId);
    const actor = await this.usersService.findById(userId);

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    await this.likesService.likeTarget({
      userId,
      actorDisplayName: `${actor.firstName} ${actor.lastName}`,
      targetType: LikeTargetType.COMMENT,
      targetId: commentId,
    });
    await this.commentsRepository.increment({ id: commentId }, 'likeCount', 1);

    return this.getCommentById(commentId, userId);
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.getAccessibleCommentOrFail(commentId, userId);

    const removed = await this.likesService.unlikeTarget({
      userId,
      targetType: LikeTargetType.COMMENT,
      targetId: commentId,
    });

    if (removed && comment.likeCount > 0) {
      await this.commentsRepository.decrement({ id: commentId }, 'likeCount', 1);
    }

    return this.getCommentById(commentId, userId);
  }

  async listCommentLikes(commentId: string, userId: string) {
    await this.getAccessibleCommentOrFail(commentId, userId);
    return this.likesService.listLikes(LikeTargetType.COMMENT, commentId);
  }

  async getCommentById(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.postsService.findAccessiblePostOrFail(comment.postId, userId);
    const likedByCurrentUser = await this.likesService.hasUserLiked(
      userId,
      LikeTargetType.COMMENT,
      comment.id,
    );

    return this.serializeComment(comment, likedByCurrentUser);
  }

  private async getAccessibleCommentOrFail(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.postsService.findAccessiblePostOrFail(comment.postId, userId);
    return comment;
  }

  private serializeComment(
    comment: Comment,
    likedByCurrentUser: boolean,
    replies: unknown[] = [],
  ) {
    return {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      body: comment.body,
      likeCount: comment.likeCount,
      replyCount: comment.replyCount,
      likedByCurrentUser,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        email: comment.author.email,
      },
      replies,
    };
  }
}

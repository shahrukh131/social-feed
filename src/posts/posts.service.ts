import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesService } from '../likes/likes.service';
import { LikeTargetType } from '../likes/entities/like.entity';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostVisibility } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly likesService: LikesService,
    private readonly usersService: UsersService,
  ) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    uploadedImageUrl?: string,
  ) {
    const post = this.postsRepository.create({
      authorId: userId,
      text: createPostDto.text.trim(),
      visibility: createPostDto.visibility,
      imageUrl: uploadedImageUrl ?? createPostDto.imageUrl?.trim() ?? null,
    });

    const savedPost = await this.postsRepository.save(post);
    return this.getPostById(savedPost.id, userId);
  }

  async getFeed(userId: string) {
    const posts = await this.postsRepository.find({
      where: [
        { visibility: PostVisibility.PUBLIC },
        { visibility: PostVisibility.PRIVATE, authorId: userId },
      ],
      relations: { author: true },
      order: { createdAt: 'DESC', id: 'DESC' },
    });

    const likedPostIds = await this.likesService.getLikedTargetIds(
      userId,
      LikeTargetType.POST,
      posts.map((post) => post.id),
    );

    return posts.map((post) => this.serializePost(post, likedPostIds.has(post.id)));
  }

  async getPostById(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccessPost(post, userId);

    const likedByCurrentUser = await this.likesService.hasUserLiked(
      userId,
      LikeTargetType.POST,
      post.id,
    );

    return this.serializePost(post, likedByCurrentUser);
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccessPost(post, userId);
    const actor = await this.usersService.findById(userId);

    if (!actor) {
      throw new NotFoundException('User not found');
    }

    await this.likesService.likeTarget({
      userId,
      actorDisplayName: `${actor.firstName} ${actor.lastName}`,
      targetType: LikeTargetType.POST,
      targetId: postId,
    });
    await this.postsRepository.increment({ id: postId }, 'likeCount', 1);

    return this.getPostById(postId, userId);
  }

  async unlikePost(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccessPost(post, userId);

    const removed = await this.likesService.unlikeTarget({
      userId,
      targetType: LikeTargetType.POST,
      targetId: postId,
    });

    if (removed && post.likeCount > 0) {
      await this.postsRepository.decrement({ id: postId }, 'likeCount', 1);
    }

    return this.getPostById(postId, userId);
  }

  async listPostLikes(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccessPost(post, userId);
    return this.likesService.listLikes(LikeTargetType.POST, postId);
  }

  incrementCommentCount(postId: string) {
    return this.postsRepository.increment({ id: postId }, 'commentCount', 1);
  }

  async findAccessiblePostOrFail(postId: string, userId: string) {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertCanAccessPost(post, userId);
    return post;
  }

  private assertCanAccessPost(post: Post, userId: string) {
    if (post.visibility === PostVisibility.PRIVATE && post.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to access this post');
    }
  }

  private serializePost(post: Post, likedByCurrentUser: boolean) {
    return {
      id: post.id,
      text: post.text,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      likedByCurrentUser,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        email: post.author.email,
      },
    };
  }
}

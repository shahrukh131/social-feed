import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Like, LikeTargetType } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async likeTarget(input: {
    userId: string;
    actorDisplayName: string;
    targetType: LikeTargetType;
    targetId: string;
  }) {
    const existingLike = await this.likesRepository.findOne({
      where: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    });

    if (existingLike) {
      throw new ConflictException('Already liked');
    }

    const like = this.likesRepository.create(input);
    await this.likesRepository.save(like);
    return like;
  }

  async unlikeTarget(input: {
    userId: string;
    targetType: LikeTargetType;
    targetId: string;
  }) {
    const result = await this.likesRepository.delete(input);
    return result.affected ? true : false;
  }

  async hasUserLiked(userId: string, targetType: LikeTargetType, targetId: string) {
    const count = await this.likesRepository.count({
      where: { userId, targetType, targetId },
    });
    return count > 0;
  }

  async getLikedTargetIds(
    userId: string,
    targetType: LikeTargetType,
    targetIds: string[],
  ) {
    if (!targetIds.length) {
      return new Set<string>();
    }

    const likes = await this.likesRepository.find({
      select: { targetId: true },
      where: { userId, targetType, targetId: In(targetIds) },
    });

    return new Set(likes.map((like) => like.targetId));
  }

  async listLikes(targetType: LikeTargetType, targetId: string) {
    const likes = await this.likesRepository.find({
      where: { targetType, targetId },
      order: { createdAt: 'DESC' },
    });

    return likes.map((like) => ({
      userId: like.userId,
      displayName: like.actorDisplayName,
      likedAt: like.createdAt,
    }));
  }
}

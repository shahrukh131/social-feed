import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostVisibility } from '../../posts/entities/post.entity';

export class SafeUserDto {
  @ApiProperty({ example: 'f3e5cacc-0eb1-4a74-9b4f-dc1601a54abc' })
  id!: string;

  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty({ example: '2026-06-12T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-12T14:00:00.000Z' })
  updatedAt!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}

export class AuthorDto {
  @ApiProperty({ example: 'f3e5cacc-0eb1-4a74-9b4f-dc1601a54abc' })
  id!: string;

  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;
}

export class PostResponseDto {
  @ApiProperty({ example: '1da7c6fd-84eb-49c8-87c9-2fcd5a166db3' })
  id!: string;

  @ApiProperty({ example: 'Hello from my first post' })
  text!: string;

  @ApiPropertyOptional({ example: '/uploads/1718201200-123456789.jpg', nullable: true })
  imageUrl?: string | null;

  @ApiProperty({ enum: PostVisibility, example: PostVisibility.PUBLIC })
  visibility!: PostVisibility;

  @ApiProperty({ example: 4 })
  likeCount!: number;

  @ApiProperty({ example: 7 })
  commentCount!: number;

  @ApiProperty({ example: true })
  likedByCurrentUser!: boolean;

  @ApiProperty({ example: '2026-06-12T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-12T14:05:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: AuthorDto })
  author!: AuthorDto;
}

export class LikeListItemDto {
  @ApiProperty({ example: 'f3e5cacc-0eb1-4a74-9b4f-dc1601a54abc' })
  userId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  displayName!: string;

  @ApiProperty({ example: '2026-06-12T14:10:00.000Z' })
  likedAt!: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: 'cae2538d-1c6f-4fcb-9f8c-c36c51f8506b' })
  id!: string;

  @ApiProperty({ example: '1da7c6fd-84eb-49c8-87c9-2fcd5a166db3' })
  postId!: string;

  @ApiPropertyOptional({
    example: '7eab4ba1-342b-4d1a-90a6-e1e0f8be7e70',
    nullable: true,
  })
  parentCommentId?: string | null;

  @ApiProperty({ example: 'This is a thoughtful comment.' })
  body!: string;

  @ApiProperty({ example: 3 })
  likeCount!: number;

  @ApiProperty({ example: 2 })
  replyCount!: number;

  @ApiProperty({ example: false })
  likedByCurrentUser!: boolean;

  @ApiProperty({ example: '2026-06-12T14:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-12T14:05:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: AuthorDto })
  author!: AuthorDto;

  @ApiPropertyOptional({ type: () => [CommentResponseDto] })
  replies?: CommentResponseDto[];
}

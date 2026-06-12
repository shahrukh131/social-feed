import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostFormDataDto {
  @ApiProperty({
    example: 'Hello from my first post',
    minLength: 1,
    maxLength: 5000,
  })
  text!: string;

  @ApiProperty({ enum: PostVisibility, example: PostVisibility.PUBLIC })
  visibility!: PostVisibility;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/image.jpg',
    description: 'Optional image URL when not uploading a file',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional uploaded image file',
  })
  image?: any;
}

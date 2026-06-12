import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEnum(PostVisibility)
  visibility!: PostVisibility;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;
}

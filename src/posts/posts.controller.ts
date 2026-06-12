import {
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post as HttpPost,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

const uploadDirectory = 'uploads';
mkdirSync(uploadDirectory, { recursive: true });

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  getFeed(@CurrentUser() user: JwtUser) {
    return this.postsService.getFeed(user.sub);
  }

  @HttpPost()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  createPost(
    @CurrentUser() user: JwtUser,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i })
        .addMaxSizeValidator({ maxSize: 5_000_000 })
        .build({ fileIsRequired: false }),
    )
    file?: Express.Multer.File,
  ) {
    const uploadedImageUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.postsService.createPost(user.sub, createPostDto, uploadedImageUrl);
  }

  @Get(':id')
  getPost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.getPostById(id, user.sub);
  }

  @HttpPost(':id/like')
  likePost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.likePost(id, user.sub);
  }

  @Delete(':id/like')
  unlikePost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.unlikePost(id, user.sub);
  }

  @Get(':id/likes')
  listLikes(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.listPostLikes(id, user.sub);
  }
}

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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  LikeListItemDto,
  PostResponseDto,
} from '../common/swagger/api-doc.models';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostFormDataDto } from './dto/create-post-form-data.dto';
import { PostsService } from './posts.service';

const uploadDirectory = 'uploads';
mkdirSync(uploadDirectory, { recursive: true });

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get the authenticated user feed ordered by newest first' })
  @ApiOkResponse({ type: PostResponseDto, isArray: true })
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
  @ApiOperation({ summary: 'Create a post with text and optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostFormDataDto })
  @ApiCreatedResponse({ type: PostResponseDto })
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
  @ApiOperation({ summary: 'Get a single post if it is visible to the current user' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiForbiddenResponse({ description: 'Private post is not accessible' })
  getPost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.getPostById(id, user.sub);
  }

  @HttpPost(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiForbiddenResponse({ description: 'Private post is not accessible' })
  likePost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.likePost(id, user.sub);
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiForbiddenResponse({ description: 'Private post is not accessible' })
  unlikePost(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.unlikePost(id, user.sub);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'List users who liked a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiOkResponse({ type: LikeListItemDto, isArray: true })
  @ApiForbiddenResponse({ description: 'Private post is not accessible' })
  listLikes(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.postsService.listPostLikes(id, user.sub);
  }
}

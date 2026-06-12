import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users/users.service';

@Injectable()
export class AppSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppSeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed =
      (this.configService.get<string>('SEED_DEFAULT_USER_ENABLED') ?? 'true')
        .trim()
        .toLowerCase() !== 'false';

    if (!shouldSeed) {
      return;
    }

    const email = (
      this.configService.get<string>('SEED_DEFAULT_USER_EMAIL') ??
      'admin@mail.com'
    )
      .trim()
      .toLowerCase();

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      this.logger.log(`Default seeded user already exists: ${email}`);
      return;
    }

    const firstName = (
      this.configService.get<string>('SEED_DEFAULT_USER_FIRST_NAME') ?? 'Admin'
    ).trim();
    const lastName = (
      this.configService.get<string>('SEED_DEFAULT_USER_LAST_NAME') ?? 'User'
    ).trim();
    const password =
      this.configService.get<string>('SEED_DEFAULT_USER_PASSWORD') ??
      'Admin12345';

    const passwordHash = await bcrypt.hash(password, 12);

    await this.usersService.create({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    this.logger.log(
      `Default seeded user created: ${email} (password: ${password})`,
    );
  }
}

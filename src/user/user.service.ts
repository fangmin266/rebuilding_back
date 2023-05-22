import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateSocialUserDto, CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PageOptionDto } from '@root/common/dto/page-option.dto';
import { Page } from '@root/common/dto/page.dto';
import { PageMetaDto } from '@root/common/dto/page-meta.dto';
import * as bcrypt from 'bcryptjs';
import { Cron } from '@nestjs/schedule';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers(pageOptionDto: PageOptionDto): Promise<Page<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder
      .orderBy('user.createdAt', pageOptionDto.order)
      .skip(pageOptionDto.skip)
      .take(pageOptionDto.take);
    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionDto });
    return new Page(entities, pageMetaDto);
  }

  async getByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (user) return user;
  }

  async getById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (user) return user;
    throw new HttpException(
      'user with this id does not exit',
      HttpStatus.NOT_FOUND,
    );
  }
  async create(userData: CreateUserDto) {
    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async createSocial(userData: CreateSocialUserDto) {
    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async update(updatedUserDto: UpdateUserDto, id: string) {
    const alreadyExist = await this.getById(id);
    if (alreadyExist !== null) {
      try {
        await this.userRepository.update(
          { id },
          {
            username: updatedUserDto.username,
            profile_img: updatedUserDto.profile_img,
            userrole: updatedUserDto.userrole,
            currentHashedRefreshToken: updatedUserDto.currentHashedRefreshToken,
          },
        );
      } catch (error) {
        throw new HttpException('업데이트에러.', HttpStatus.BAD_REQUEST);
      }
    } else {
      throw new HttpException('수정할 user 없습니다.', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id: string) {
    const findId = await this.getById(id);
    try {
      if (findId) {
        if (id) {
          await this.userRepository.delete({ id });
        } else
          throw new HttpException(
            '입력한 id가 없습니다.',
            HttpStatus.NOT_FOUND,
          );
      } else {
        throw new HttpException(
          '삭제할 id정보가 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException('삭제에러.', HttpStatus.BAD_REQUEST);
    }
  }

  async markEmailAsConfirmed(email: string) {
    return this.userRepository.update(
      { email },
      {
        isEmailConfirmed: true,
      },
    );
  }

  async changePassword(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    user.password = await bcrypt.hash(password, 10); //변경되는 password값도 hash처리
    return this.userRepository.save(user);
  }

  async findPasswordByEmail(email: string) {
    const findUser = await this.userRepository.findOneBy({ email });
    if (findUser) {
      return findUser;
    } else {
      throw new HttpException(
        'User with email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async setCurrnetsRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  // @Cron('10 * * * * *') //10초마다 로그 =>구독,결제 시 사용많이함 (정기결제같은거 **)
  // handleCron() {
  //   this.logger.debug('cron logger');
  // }
}

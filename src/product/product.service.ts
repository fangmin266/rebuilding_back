import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdatedProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
// import { RepoName } from '@root/user/entities/error.enum';

// export const repo = RepoName.PRODUCT;
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createAll() {
    const { data, status } = await this.httpService
      .get(this.configService.get('DUMMY_JSON') + 'products')
      .toPromise();
    if (status === 200) {
      const datas = data.products;
      console.log(datas, 'datas');
      const productData = [];
      datas?.map((data) =>
        productData.push({
          title: data.title,
          content: data.description,
          productLimit: data.stock,
          price: data.price,
          startFunding: new Date(),
          endFunding: new Date(),
          startDelivery: new Date(),
          productImage: data.images,
          thumbnail: data.thumbnail,
        }),
      );
      return await this.productRepository.save(productData);
    }
  }
  async create(createProductDto: CreateProductDto) {
    const alreadyExist = await this.getByTitle(createProductDto.title);
    if (alreadyExist === null) {
      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      await this.setAllProductCache();
      return newProduct;
    } else {
      throw new HttpException('title이 존재합니다', HttpStatus.BAD_REQUEST);
    }
  }

  async getAll() {
    // const cacheProduct = await this.cacheManager.get('products');
    // return cacheProduct;
    //일단 db에서 부르기
    const allProduct = await this.productRepository.findBy({});
    return allProduct;
  }

  async setAllProductCache() {
    const products = await this.productRepository.findBy({});
    await this.cacheManager.set('products', products);
  }

  async getById(id: string) {
    const findId = await this.productRepository.findOneBy({ id });
    try {
      if (findId && findId !== null) {
        return findId;
      } else {
        throw new HttpException(`no ${'product'} id`, HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(`${'product'}byid error`, HttpStatus.NOT_FOUND);
    }
  }

  async getByTitle(title: string) {
    return await this.productRepository.findOneBy({ title });
  }

  async update(updatedProductDto: UpdatedProductDto, id: string) {
    const alreadyExist = await this.getById(id);
    if (alreadyExist !== null) {
      try {
        await this.productRepository.update(
          { id },
          {
            title: updatedProductDto.title,
            content: updatedProductDto.content,
            startFunding: updatedProductDto.startFunding,
            startDelivery: updatedProductDto.startDelivery,
            deliveryFee: updatedProductDto.deliveryFee,
            productLimit: updatedProductDto.productLimit,
            price: updatedProductDto.price,
          },
        );
        await this.setAllProductCache();
        return 'success';
      } catch (error) {
        throw new HttpException(
          `${'product'} update error`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        '수정할 productNum이 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteProduct(id: string) {
    const findId = await this.getById(id);
    try {
      if (findId) {
        await this.productRepository.delete({ id });
      } else {
        throw new HttpException(`no ${'product'} id `, HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        `delete ${'product'} error`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

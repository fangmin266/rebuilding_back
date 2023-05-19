import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatedProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const alreadyExist = await this.getByTitle(createProductDto.title);
    if (alreadyExist === null) {
      const newProduct = this.productRepository.create(createProductDto);
      await this.productRepository.save(newProduct);
      return newProduct;
    } else {
      throw new HttpException('title이 존재합니다', HttpStatus.BAD_REQUEST);
    }
  }

  async getAll() {
    const products = await this.productRepository.find({});
    return products;
  }

  async getById(id: string) {
    const findId = await this.productRepository.findOneBy({ id });
    try {
      if (findId && findId !== null) {
        return findId;
      } else {
        throw new HttpException('id가 없습니다.', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException('id가 없습니다.', HttpStatus.NOT_FOUND);
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
            startDeleviery: updatedProductDto.startDeleviery,
            deliveryFee: updatedProductDto.deliveryFee,
            productLimit: updatedProductDto.productLimit,
            price: updatedProductDto.price,
          },
        );
        return 'success';
      } catch (error) {
        throw new HttpException('업데이트에러.', HttpStatus.BAD_REQUEST);
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
        if (id) await this.productRepository.delete({ id });
        else
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
}

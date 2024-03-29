import { BadRequestException, Injectable } from '@nestjs/common';
import { Orders } from './entities/orders.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Goods } from 'src/goods/entities/goods.entity';
import { Stocks } from 'src/goods/entities/stocks.entity';
import { Users } from 'src/user/entities/user.entitiy';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private readonly dataSource: DataSource,
  ) {}

  async purchase(
    user_id: number,
    createOrderDto: CreateOrderDto, //포스트맨의 body,
  ) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { o_tel, o_addr, o_count, o_req, goods_id } = createOrderDto;
      const goods = await queryRunner.manager.findOne(Goods, {
        where: {
          id: goods_id,
        },
      });
      // ======굿즈 있는지 없는지 따라 유효성 검사 필요

      const quantity = await queryRunner.manager.findOne(Stocks, {
        where: {
          id: goods_id,
        },
      });
      const count = quantity.count - o_count;

      if (count < 0) {
        throw new BadRequestException('재고가 없습니다.');
      }

      const user = await queryRunner.manager.findOne(Users, {
        where: {
          id: user_id,
        },
      });
      // ======유저 있는지 없는지 따라 유효성 검사 필요

      const paying = goods.g_price * o_count;
      const afterPaidPoints = user.points - paying;
      if (afterPaidPoints < 0) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      quantity.count = count;
      user.points = afterPaidPoints;
      await queryRunner.manager.save(Stocks, quantity);
      await queryRunner.manager.save(Users, user);

      const newOrder = this.ordersRepository.create({
        user_id,
        o_name: user.name,
        o_tel,
        o_addr,
        o_req,
        o_count,
        o_total_price: paying,
      });

      await this.ordersRepository.save(newOrder);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return newOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.error(err);
      throw err;
    }
  }

  async findAll() {
    return `This action returns all goods`;
  }

  findOne(id: number) {
    return `This action returns a #${id} good`;
  }
}

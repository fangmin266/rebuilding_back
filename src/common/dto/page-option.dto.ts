import { Order } from '../constants/order.enum';

export class PageOptionDto {
  readonly order?: Order = Order.ASC;

  readonly page?: number = 1;

  readonly take?: number = 10;

  get skip(): number {
    // 동적 계산
    return (this.page - 1) * this.take;
  }
}

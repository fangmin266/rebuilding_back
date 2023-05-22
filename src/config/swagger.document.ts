import { DocumentBuilder } from '@nestjs/swagger';

export class BaseAPIDocument {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('rebuilding_back')
      .setDescription('rebuilding_back')
      .setVersion('1.0')
      .build();
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getReport() {
    return Buffer.from('Hello report');
  }
}

import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
    super({ message, code }, HttpStatus.BAD_REQUEST);
  }
}

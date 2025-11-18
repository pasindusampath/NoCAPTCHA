import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseDto } from '../../common/base_dto';
import { IBodyDto } from '../../../interfaces';

/**
 * DTO for verifying a Cloudflare Turnstile token
 */
export class VerifyRequestDto extends BaseDto implements IBodyDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;

  @IsString({ message: 'Page must be a string' })
  @IsOptional()
  page?: string;

  constructor(data?: { token?: string; page?: string }) {
    super();
    if (data) {
      this.token = data.token || '';
      this.page = data.page;
    }
  }
}


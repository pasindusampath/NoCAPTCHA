/**
 * DTO for block IP response
 */
export class BlockIpResponseDto {
  ip: string;
  blocked: boolean;
  message: string;

  constructor(data: {
    ip: string;
    blocked: boolean;
    message: string;
  }) {
    this.ip = data.ip;
    this.blocked = data.blocked;
    this.message = data.message;
  }
}


/**
 * DTO for Cloudflare Turnstile verification response
 */
export class VerifyResponseDto {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;

  constructor(data: {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
    action?: string;
    cdata?: string;
  }) {
    this.success = data.success;
    this.challenge_ts = data['challenge_ts'];
    this.hostname = data.hostname;
    this['error-codes'] = data['error-codes'];
    this.action = data.action;
    this.cdata = data.cdata;
  }
}


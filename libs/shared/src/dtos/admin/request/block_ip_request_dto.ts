/**
 * DTO for block IP request
 */
export class BlockIpRequestDto {
  durationMinutes?: number;

  constructor(data?: {
    durationMinutes?: number;
  }) {
    this.durationMinutes = data?.durationMinutes;
  }
}


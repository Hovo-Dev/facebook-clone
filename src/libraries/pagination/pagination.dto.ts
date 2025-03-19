import { ApiPropertyOptional } from '@nestjs/swagger';

export default class PaginationDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  limit?: number;
}

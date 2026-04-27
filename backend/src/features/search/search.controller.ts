import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/presentation/decorators/current-user.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@CurrentUser() user: any, @Query('q') query: string) {
    return this.searchService.search(user.orgId, query);
  }
}

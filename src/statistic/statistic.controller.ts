import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async receiveFullStatistic(@Req() req) {
    return this.statisticService.receiveFullStatistic(req.user.id);
  }
}

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  public async receiveFullStatistic(@Req() req: Request) {
    return this.statisticService.receiveFullStatistic(req.user.id);
  }
}

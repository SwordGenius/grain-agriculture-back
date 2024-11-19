import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { StatisticsService } from './stadistics.service';
import { MovementPredictionResponseDto} from './dto/movement-prediction.dto';
import { UserGuard } from '../users/guards/user.guard';

@Controller('statistics')
@UseGuards(UserGuard)
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,

  ) {}

  @Get()
  async getStatistics(@Res() res: Response) {
    try {
      const result = await this.statisticsService.calculateStatistics();
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error
      });
    }

  }
  @Get('movement-prediction')
  async getMovementPrediction(@Res() res: Response) {
    try {
      const probability = await this.statisticsService.predictMovement();
      return res.status(200).json({
        probability
      } as MovementPredictionResponseDto);
    } catch (error: any) {
      return res.status(500).json({
        error: error
      });
    }
  }

}
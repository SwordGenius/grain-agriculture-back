import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/auth.guard';
import { StatisticsService } from './statistics.service';
import { MovementPredictionResponseDto} from './dto/movement-prediction.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,

  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Res() res: Response) {
    try {
      const result = await this.statisticsService.calculateStatistics();
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error calculating statistics'
      });
    }
    
  }
  @Get('movement-prediction')
  @UseGuards(JwtAuthGuard)
  async getMovementPrediction(@Res() res: Response) {
    try {
      const probability = await this.statisticsService.predictMovement();
      return res.status(200).json({
        probability
      } as MovementPredictionResponseDto);
    } catch (error) {
      return res.status(500).json({
        probability: 0
      });
    }
  }
 
}
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/auth.guard';
import { StatisticsService } from './statistics.service';
import { MovementAnalysisService } from './analysis.service';
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly movementAnalysisService: MovementAnalysisService
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
  async getMovementPrediction() {
    return this.movementAnalysisService.analyzeMovements();
  }
}
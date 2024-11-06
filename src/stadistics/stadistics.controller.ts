import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { StadisticsService } from './stadistics.service';
import { CreateStadisticsDto } from './dto/create-stadistics.dto';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('stadistics')
export class StadisticsController {

  constructor(private readonly stadisticsService: StadisticsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createStadisticsDto: CreateStadisticsDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const createdStadistic = await this.stadisticsService.create(createStadisticsDto);
      const data = {
        message: 'Stadistic created',
        data: createdStadistic,
      };
      return res.status(201).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  }
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const stadistics = await this.stadisticsService.findAll(limit, page);
      if (stadistics.length === 0) {
        return res.status(404).send('No data found');
      }
      const data = {
        message: 'Stadistics found',
        data: stadistics,
        limit: limit,
        page: page,
      };
      
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const stadistic = await this.stadisticsService.findOne(id);
      if (!stadistic) {
        return res.status(404).send('Data not found');
      }
      const data = {
        message: 'Stadistic found',
        data: stadistic,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateStadisticsDto: CreateStadisticsDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updatedStadistic = await this.stadisticsService.update(id, updateStadisticsDto);
      if (!updatedStadistic) {
        return res.status(404).send('Data not found');
      }
      const data = {
        message: 'Stadistic updated',
        data: updatedStadistic,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { deletedCount } = await this.stadisticsService.delete(id);
      if (deletedCount === 0) {
        return res.status(404).send('Data not found');
      }
      const data = {
        message: 'Stadistic deleted',
        data: deletedCount,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

}

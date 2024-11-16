import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { GrainSensorService } from './grain-sensor.service';
import { CreateGrainSensorDto } from './dto/create-grain-sensor.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('grain-sensor')
export class GrainSensorController {
  constructor(private readonly grainSensorService: GrainSensorService) {

  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Res() res: Response, @Body() createGrainSensorDto: CreateGrainSensorDto) {
    try {
      const grainSensor = await this.grainSensorService.create(createGrainSensorDto);
      if (!grainSensor) {
        return res.status(400).json({
          message: 'GrainSensor not created',
        });
      }
      const data = {
        message: 'GrainSensor has been created successfully',
        data: grainSensor,
      };
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error: GrainSensor not created',
        error: error.message,
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Res() res: Response,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ): Promise<Response> {
    try {
      const limitValue = limit ? parseInt(limit, 10) : 0;
      const pageValue = page ? parseInt(page, 10) : 0;
      const grainSensors = await this.grainSensorService.findAll(
        limitValue,
        pageValue,
      );
      return res.status(200).json({
        message: 'GrainSensor data retrieved successfully',
        data: grainSensors,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving GrainSensor data',
        error: error.message,
      });
    }
  }


  @Get(':id')
  async findOne(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    try {
      const grainSensor = await this.grainSensorService.findOne(id);
      if (!grainSensor) {
        return res.status(404).json({
          message: 'GrainSensor not found',
        });
      }
      const data = {
        message: 'GrainSensor has been found successfully',
        data: grainSensor,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error: GrainSensor not found',
        error: error.message,
      });
    }
  }
  
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() createGrainSensorDto: CreateGrainSensorDto,
  ): Promise<Response> {
    try {
      const grainSensor = await this.grainSensorService.update(
        id,
        createGrainSensorDto,
      );
      if (!grainSensor) {
        return res.status(404).json({
          message: 'GrainSensor not found',
        });
      }
      const data = {
        message: 'GrainSensor has been updated successfully',
        data: grainSensor,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error: GrainSensor not updated',
        error: error.message,
      });
    }
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<Response> {
    try {
      const grainSensor = await this.grainSensorService.delete(id);
      if (!grainSensor) {
        return res.status(404).json({
          message: 'GrainSensor not found',
        });
      }
      const data = {
        message: 'GrainSensor has been deleted successfully',
        data: grainSensor,
      };
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error: GrainSensor not deleted',
        error: error.message
      });
    }
  }
}

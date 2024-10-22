import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { MovementService } from './movement.service';
import { Response } from 'express';
import { CreateMovementDto } from './dto/create-movement.dto';


@Controller('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  async create(
    @Body() createMovementDto: CreateMovementDto,
    @Res() res: Response,
  ): Promise<Response> {
    const movement = await this.movementService.create(createMovementDto);
    if (!movement) {
      return res.status(400).json({
        message: "The movement could not be created",
      });
    }
    const data = {
      message: "The movement has been created",
      data: movement
    }
    return res.status(201).json(data);
  }

  @Get()
  async findAll(
    @Res() res: Response,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ): Promise<Response> {
    const limitNumber = limit ? parseInt(limit, 10) : 0;
    const pageNumber = page ? parseInt(page, 10) : 0;
    const movements = await this.movementService.findAll(
      limitNumber,
      pageNumber,
    );
    if (movements.length === 0) {
      return res.status(404).json({
        message: "There are no movements",
      });
    }
    if ((limitNumber > 0) && (pageNumber > 0)) {
      const data = {
        message: "Movements have been found",
        data: movements,
        page: pageNumber
      };
      return res.status(200).json(data);
    }
    const data = {
      message: "Movements have been found",
      data: movements
    };
    return res.status(200).json(data);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const movement = await this.movementService.findOne(id);
    if (!movement) {
      return res.status(404).json({
        message: "The movement does not exist",
      });
    }
    const data = {
      message: "The movement has been found",
      data: movement
    };
    return res.status(200).json(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMovementDto: CreateMovementDto,
    @Res() res: Response,
  ): Promise<Response> {
    const movement = await this.movementService.update(id, updateMovementDto);
    if (!movement) {
      return res.status(404).json({
        message: "The movement does not exist",
      });
    }
    const data = {
      message: "The movement has been updated",
      data: movement
    };
    return res.status(200).json(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string,
               @Res() res: Response): Promise<Response> {
    const { deletedCount } = await this.movementService.delete(id);
    if (!deletedCount) {
      return res.status(404).json({
        message: "The movement does not exist",
      });
    }
    const data = {
      message: "The movement has been deleted",
      deletedCount
    };
    return res.status(200).json(data);
  }
}

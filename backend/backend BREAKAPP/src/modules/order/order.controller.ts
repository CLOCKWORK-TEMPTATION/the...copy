import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('CREW', 'DIRECTOR')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @Roles('DIRECTOR', 'RUNNER')
  findAll() {
    return this.orderService.findAll();
  }

  @Get('session/:sessionId')
  @Roles('DIRECTOR', 'RUNNER')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.orderService.findAll(sessionId);
  }

  @Get('my-orders')
  @Roles('CREW')
  findMyOrders(@Request() req: any) {
    // Use user_hash from JWT payload
    const userHash = req.user.user_hash;
    return this.orderService.findByUserHash(userHash);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('DIRECTOR', 'RUNNER')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orderService.updateStatus(id, body.status);
  }

  @Post('session/:sessionId/batch')
  @Roles('DIRECTOR', 'RUNNER')
  batchOrders(@Param('sessionId') sessionId: string) {
    return this.orderService.batchOrdersByVendor(sessionId);
  }

  @Post('session/:sessionId/lock')
  @Roles('DIRECTOR')
  lockSession(@Param('sessionId') sessionId: string) {
    return this.orderService.lockSession(sessionId);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Roles('DIRECTOR')
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(createVendorDto);
  }

  @Get()
  findAll() {
    return this.vendorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Get(':id/menu')
  async getMenu(@Param('id') id: string, @Request() req: any) {
    // Hide prices for CREW role
    const includePrice = req.user?.role !== 'CREW';
    return this.vendorService.getMenu(id, includePrice);
  }

  @Patch(':id')
  @Roles('DIRECTOR')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @Roles('DIRECTOR')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(id);
  }

  @Post(':id/menu')
  @Roles('DIRECTOR')
  addMenuItem(@Param('id') id: string, @Body() menuItem: any) {
    return this.vendorService.addMenuItem(id, menuItem);
  }
}

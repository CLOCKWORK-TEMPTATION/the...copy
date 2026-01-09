import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async create(createVendorDto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        name: createVendorDto.name,
        fixed_location: {
          lat: createVendorDto.lat,
          lng: createVendorDto.lng,
        } as any,
        is_mobile: createVendorDto.is_mobile || false,
      },
    });
  }

  async findAll() {
    return this.prisma.vendor.findMany({
      include: {
        menu_items: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: {
        menu_items: {
          where: { available: true },
        },
      },
    });
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    const data: any = {
      updated_at: new Date(),
    };

    if (updateVendorDto.name) data.name = updateVendorDto.name;
    if (updateVendorDto.is_mobile !== undefined)
      data.is_mobile = updateVendorDto.is_mobile;
    if (updateVendorDto.lat && updateVendorDto.lng) {
      data.fixed_location = {
        lat: updateVendorDto.lat,
        lng: updateVendorDto.lng,
      } as any;
    }

    return this.prisma.vendor.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }

  async addMenuItem(vendorId: string, menuItem: any) {
    return this.prisma.menuItem.create({
      data: {
        vendor_id: vendorId,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        available: menuItem.available ?? true,
      },
    });
  }

  async getMenu(vendorId: string, includePrice: boolean = true) {
    const items = await this.prisma.menuItem.findMany({
      where: {
        vendor_id: vendorId,
        available: true,
      },
    });

    if (!includePrice) {
      // Remove price for CREW role
      return items.map(({ price, ...item }) => item);
    }

    return items;
  }
}

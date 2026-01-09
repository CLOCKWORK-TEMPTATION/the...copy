import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // Calculate total cost
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: {
          in: createOrderDto.items.map((item) => item.menuItemId),
        },
      },
    });

    let totalCost = 0;
    const itemsWithDetails = createOrderDto.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      const cost = menuItem ? Number(menuItem.price) * item.quantity : 0;
      totalCost += cost;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        name: menuItem?.name || 'Unknown',
        price: menuItem?.price || 0,
      };
    });

    return this.prisma.order.create({
      data: {
        session_id: createOrderDto.sessionId,
        user_hash: createOrderDto.userHash,
        items: itemsWithDetails,
        cost_internal: totalCost,
        status: 'pending',
      },
    });
  }

  async findAll(sessionId?: string) {
    return this.prisma.order.findMany({
      where: sessionId ? { session_id: sessionId } : undefined,
      include: {
        session: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });
  }

  async findByUserHash(userHash: string) {
    return this.prisma.order.findMany({
      where: { user_hash: userHash },
      include: {
        session: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status, updated_at: new Date() },
    });
  }

  /**
   * Batch orders by vendor for efficient delivery
   */
  async batchOrdersByVendor(sessionId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        session_id: sessionId,
        status: 'pending',
      },
    });

    // Group items by vendor
    const vendorBatches: Record<string, any> = {};

    for (const order of orders) {
      const items = order.items as any[];
      for (const item of items) {
        // Get menu item to find vendor
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { vendor: true },
        });

        if (menuItem) {
          const vendorId = menuItem.vendor_id;
          if (!vendorBatches[vendorId]) {
            vendorBatches[vendorId] = {
              vendorId,
              vendorName: menuItem.vendor.name,
              orders: [],
              totalItems: 0,
            };
          }

          vendorBatches[vendorId].orders.push({
            orderId: order.id,
            userHash: order.user_hash,
            items: [item],
          });
          vendorBatches[vendorId].totalItems += item.quantity;
        }
      }
    }

    return Object.values(vendorBatches);
  }

  async lockSession(sessionId: string) {
    return this.prisma.dailySession.update({
      where: { id: sessionId },
      data: { status: 'LOCKED' },
    });
  }
}

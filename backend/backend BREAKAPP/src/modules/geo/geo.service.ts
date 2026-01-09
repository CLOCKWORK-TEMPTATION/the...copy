import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface Location {
  lat: number;
  lng: number;
}

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Find vendors within a radius (in meters) from a center point
   * Mimics PostGIS ST_DWithin functionality
   */
  async findVendorsInRange(
    centerPoint: Location,
    radiusMeters: number = 3000,
  ) {
    // Get all vendors
    const vendors = await this.prisma.vendor.findMany();

    // Filter vendors within range
    const vendorsInRange = vendors.filter((vendor) => {
      const vendorLocation = vendor.fixed_location as any;
      const distance = this.calculateDistance(centerPoint, {
        lat: vendorLocation.lat,
        lng: vendorLocation.lng,
      });

      return distance <= radiusMeters;
    });

    // Add distance to each vendor
    return vendorsInRange.map((vendor) => {
      const vendorLocation = vendor.fixed_location as any;
      const distance = this.calculateDistance(centerPoint, {
        lat: vendorLocation.lat,
        lng: vendorLocation.lng,
      });

      return {
        ...vendor,
        distance,
      };
    });
  }

  /**
   * Validate location coordinates
   */
  isValidLocation(location: Location): boolean {
    return (
      location.lat >= -90 &&
      location.lat <= 90 &&
      location.lng >= -180 &&
      location.lng <= 180
    );
  }

  /**
   * Update project's active location
   */
  async updateProjectLocation(projectId: string, location: Location) {
    if (!this.isValidLocation(location)) {
      throw new Error('Invalid location coordinates');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        active_location: location as any,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Create a daily session with center point
   */
  async createDailySession(projectId: string, centerPoint: Location) {
    if (!this.isValidLocation(centerPoint)) {
      throw new Error('Invalid center point coordinates');
    }

    return this.prisma.dailySession.create({
      data: {
        project_id: projectId,
        center_point: centerPoint as any,
        status: 'OPEN',
      },
    });
  }

  /**
   * Get vendors for current session
   */
  async getSessionVendors(sessionId: string, radiusMeters: number = 3000) {
    const session = await this.prisma.dailySession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const centerPoint = session.center_point as any;
    return this.findVendorsInRange(centerPoint, radiusMeters);
  }
}

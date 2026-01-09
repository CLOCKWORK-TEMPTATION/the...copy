import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SetLocationDto } from './dto/set-location.dto';

@Controller('geo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('project/:projectId/location')
  @Roles('DIRECTOR')
  async setProjectLocation(
    @Param('projectId') projectId: string,
    @Body() setLocationDto: SetLocationDto,
  ) {
    return this.geoService.updateProjectLocation(projectId, {
      lat: setLocationDto.lat,
      lng: setLocationDto.lng,
    });
  }

  @Get('vendors/nearby')
  @Roles('DIRECTOR', 'RUNNER')
  async getNearbyVendors(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const radiusMeters = radius ? parseInt(radius, 10) : 3000;
    return this.geoService.findVendorsInRange(
      {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      radiusMeters,
    );
  }

  @Post('session')
  @Roles('DIRECTOR')
  async createSession(@Body() body: { projectId: string; lat: number; lng: number }) {
    return this.geoService.createDailySession(body.projectId, {
      lat: body.lat,
      lng: body.lng,
    });
  }

  @Get('session/:sessionId/vendors')
  async getSessionVendors(
    @Param('sessionId') sessionId: string,
    @Query('radius') radius?: string,
  ) {
    const radiusMeters = radius ? parseInt(radius, 10) : 3000;
    return this.geoService.getSessionVendors(sessionId, radiusMeters);
  }
}

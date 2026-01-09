import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ProjectModule } from './modules/project/project.module.js';
import { GeoModule } from './modules/geo/geo.module.js';
import { VendorModule } from './modules/vendor/vendor.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { RealtimeModule } from './modules/realtime/realtime.module.js';
import { ReadinessModule } from './modules/readiness/readiness.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ProjectModule,
    GeoModule,
    VendorModule,
    OrderModule,
    RealtimeModule,
    ReadinessModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

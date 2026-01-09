import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

interface LocationUpdate {
  runnerId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class LocationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // In-memory store for runner locations (replace with Redis in production)
  private runnerLocations: Map<string, LocationUpdate> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('runner:location')
  handleRunnerLocation(
    @MessageBody() data: LocationUpdate,
    @ConnectedSocket() client: Socket,
  ) {
    // Store runner location
    this.runnerLocations.set(data.runnerId, {
      ...data,
      timestamp: Date.now(),
    });

    // Broadcast to directors/tracking clients
    this.server.emit('location:update', {
      runnerId: data.runnerId,
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp,
    });

    return { success: true };
  }

  @SubscribeMessage('runner:register')
  handleRunnerRegister(
    @MessageBody() data: { runnerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Join runner to their own room for targeted messages
    client.join(`runner:${data.runnerId}`);
    console.log(`Runner ${data.runnerId} registered`);
    return { success: true };
  }

  @SubscribeMessage('director:subscribe')
  handleDirectorSubscribe(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Directors subscribe to session updates
    client.join(`session:${data.sessionId}`);
    console.log(`Director subscribed to session ${data.sessionId}`);

    // Send current runner locations
    const locations = Array.from(this.runnerLocations.values());
    return { locations };
  }

  @SubscribeMessage('order:status')
  handleOrderStatus(
    @MessageBody() data: { orderId: string; status: string },
  ) {
    // Broadcast order status updates
    this.server.emit('order:update', {
      orderId: data.orderId,
      status: data.status,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  // Method to emit order updates from service
  emitOrderUpdate(orderId: string, status: string) {
    this.server.emit('order:update', {
      orderId,
      status,
      timestamp: Date.now(),
    });
  }

  // Method to send task to specific runner
  sendTaskToRunner(runnerId: string, task: any) {
    this.server.to(`runner:${runnerId}`).emit('task:new', task);
  }

  // Get all active runner locations
  getActiveRunnerLocations(): LocationUpdate[] {
    const now = Date.now();
    const activeLocations: LocationUpdate[] = [];

    this.runnerLocations.forEach((location, runnerId) => {
      // Consider locations from last 5 minutes as active
      if (now - location.timestamp < 5 * 60 * 1000) {
        activeLocations.push(location);
      }
    });

    return activeLocations;
  }
}

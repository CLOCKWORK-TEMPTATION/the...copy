# Scripts Documentation

## Available Scripts

### Start Application
```bash
pnpm start
```
Starts the entire application (Redis + Backend + Frontend) in the correct order.

### Stop Application
```bash
pnpm stop
```
Stops all running services and closes all development ports.

## Direct Script Usage

### Kill Ports
```powershell
.\scripts\kill-ports.ps1
```
Stops all processes on ports: 3000, 3001, 5000, 5001, 6379 and kills Redis server.

### Start Application
```powershell
.\scripts\start-app.ps1
```
Starts Redis, Backend (port 3001), and Frontend (port 5000) in separate windows.

## Port Configuration

- **Frontend**: 5000
- **Backend**: 3001
- **Redis**: 6379

## Notes

- Scripts automatically clean up existing processes before starting
- Each service runs in a separate PowerShell window
- Redis runs minimized in the background
- If Redis fails to start, the application continues with reduced functionality

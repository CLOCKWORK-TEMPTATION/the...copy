# 🚀 Development Scripts Guide

## Quick Start

### ▶️ Start Development Environment
```powershell
.\start-dev.ps1
```

**What it does:**
- ✅ Starts Redis server (port 6379)
- ✅ Starts Backend server (port 3001)
- ✅ Starts Frontend server (port 5000)
- ✅ Opens separate PowerShell windows for each service

**Custom Ports:**
```powershell
.\start-dev.ps1 -BackendPort 4000 -FrontendPort 3000
```

---

### ⏹️ Stop Development Environment
```powershell
.\stop-dev.ps1
```

**What it does:**
- 🛑 Stops all Node.js dev servers (Backend & Frontend)
- 🛑 Stops Redis server
- 📊 Shows summary of stopped processes

**Force Stop (if processes won't close):**
```powershell
.\stop-dev.ps1 -Force
```

---

## Access URLs

After starting:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Bull Board**: http://localhost:3001/admin/queues
- **Redis**: localhost:6379

---

## Troubleshooting

### Port Already in Use
```powershell
# Stop all services first
.\stop-dev.ps1 -Force

# Then start again
.\start-dev.ps1
```

### Redis Not Found
- Redis is optional but recommended
- App will work with reduced functionality without it
- Install Redis or use Docker: `docker run -d -p 6379:6379 redis`

### Node.js Processes Won't Stop
```powershell
# Force kill all Node.js processes
.\stop-dev.ps1 -Force

# Or manually:
Get-Process -Name "node" | Stop-Process -Force
```

### Check What's Running
```powershell
# Check Node.js processes
Get-Process -Name "node"

# Check Redis
Get-Process -Name "redis-server"

# Check ports
netstat -ano | findstr "3001"
netstat -ano | findstr "5000"
netstat -ano | findstr "6379"
```

---

## Manual Commands

If you prefer manual control:

### Backend Only
```powershell
cd backend
pnpm run dev
```

### Frontend Only
```powershell
cd frontend
pnpm run dev
```

### Redis Only
```powershell
.\redis\redis-server.exe
```

---

## Notes

- ⚠️ Closing the start script window won't stop the servers
- ⚠️ Always use `stop-dev.ps1` to properly shutdown
- ✅ Services run in separate windows for easy monitoring
- ✅ Logs are visible in each service window

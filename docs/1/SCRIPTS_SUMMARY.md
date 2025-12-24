# 📜 Development Scripts Summary

## Available Scripts

### 🎯 Main Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `start-dev.ps1` | Start all services | `.\start-dev.ps1` |
| `stop-dev.ps1` | Stop all services | `.\stop-dev.ps1` |
| `QUICK_COMMANDS.ps1` | Helper functions | `. .\QUICK_COMMANDS.ps1` |

---

## 🚀 Quick Reference

### Start Everything
```powershell
.\start-dev.ps1
```
**Starts:**
- Redis (port 6379)
- Backend (port 3001)
- Frontend (port 5000)

### Stop Everything
```powershell
.\stop-dev.ps1
```

### Force Stop (if stuck)
```powershell
.\stop-dev.ps1 -Force
```

### Custom Ports
```powershell
.\start-dev.ps1 -BackendPort 4000 -FrontendPort 3000
```

---

## 🛠️ Helper Functions

Load helper functions:
```powershell
. .\QUICK_COMMANDS.ps1
```

Then use:
```powershell
Start-Dev          # Start all
Stop-Dev           # Stop all
Restart-Dev        # Restart all
Check-Dev          # Check status
Open-Dev           # Open in browser
Show-Logs backend  # Show logs
Clean-Dev          # Clean artifacts
Help-Dev           # Show help
```

---

## 📊 What Each Script Does

### `start-dev.ps1`
1. ✅ Checks if backend/frontend folders exist
2. ✅ Starts Redis (if available)
3. ✅ Opens Backend in new PowerShell window
4. ✅ Opens Frontend in new PowerShell window
5. ✅ Shows access URLs

**Features:**
- Detects if Redis already running
- Clear progress indicators [1/3], [2/3], [3/3]
- Color-coded messages (Green=success, Yellow=warning, Red=error)
- Graceful fallback if Redis not found

### `stop-dev.ps1`
1. ✅ Finds all Node.js dev processes
2. ✅ Stops Backend & Frontend servers
3. ✅ Stops Redis server
4. ✅ Shows summary of stopped processes

**Features:**
- Smart detection (only stops dev servers, not other Node apps)
- `-Force` flag for stubborn processes
- Summary report with counts

### `QUICK_COMMANDS.ps1`
Provides convenient PowerShell functions:
- `Start-Dev` - Wrapper for start-dev.ps1
- `Stop-Dev` - Wrapper for stop-dev.ps1
- `Restart-Dev` - Stop + Start
- `Check-Dev` - Show status of all services
- `Open-Dev` - Open URLs in browser
- `Show-Logs` - Tail log files
- `Clean-Dev` - Remove build artifacts
- `Help-Dev` - Show usage

---

## 🎓 Usage Examples

### Basic Workflow
```powershell
# Start development
.\start-dev.ps1

# ... do your work ...

# Stop when done
.\stop-dev.ps1
```

### With Helper Functions
```powershell
# Load functions once per session
. .\QUICK_COMMANDS.ps1

# Use short commands
Start-Dev
Check-Dev
Open-Dev
Stop-Dev
```

### Troubleshooting
```powershell
# Check what's running
Check-Dev

# Force stop everything
Stop-Dev -Force

# Clean and restart
Clean-Dev
Start-Dev
```

### Custom Setup
```powershell
# Start with different ports
.\start-dev.ps1 -BackendPort 4000 -FrontendPort 8080

# Check if ports are free
netstat -ano | findstr "4000"
netstat -ano | findstr "8080"
```

---

## 📖 Full Documentation

- **[Arabic Guide](./DEV_SCRIPTS_README_AR.md)** - دليل كامل بالعربي
- **[English Guide](./DEV_SCRIPTS_README.md)** - Complete English guide
- **[Main README](./README.md)** - Project documentation

---

## 💡 Tips

1. **Always use `stop-dev.ps1`** - Don't just close windows
2. **Load QUICK_COMMANDS.ps1** - Makes life easier
3. **Check status first** - Use `Check-Dev` before starting
4. **Use -Force when needed** - If processes won't stop normally
5. **Monitor logs** - Each service has its own window

---

## 🐛 Common Issues

### "Port already in use"
```powershell
Stop-Dev -Force
Start-Dev
```

### "Redis not found"
- App works without Redis (reduced functionality)
- Install Redis or use Docker

### "Process won't stop"
```powershell
# Nuclear option
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "redis-server" | Stop-Process -Force
```

### "Can't run scripts"
```powershell
# Enable script execution (run as Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 Best Practices

✅ **DO:**
- Use `start-dev.ps1` for consistent setup
- Use `stop-dev.ps1` to clean shutdown
- Load `QUICK_COMMANDS.ps1` for convenience
- Check status with `Check-Dev` regularly

❌ **DON'T:**
- Close PowerShell windows directly
- Kill processes manually (unless necessary)
- Run multiple instances on same ports
- Forget to stop services when done

---

## 📞 Need Help?

- Check [DEV_SCRIPTS_README.md](./DEV_SCRIPTS_README.md) for detailed guide
- Check [DEV_SCRIPTS_README_AR.md](./DEV_SCRIPTS_README_AR.md) للدليل بالعربي
- Open an issue on GitHub
- Ask in team chat

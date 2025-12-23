# ARCHIVED - Legacy Drama Analyst Agents

## ⚠️ DEPRECATED - DO NOT USE

This directory contains the **legacy frontend-based drama analyst agents** that are **no longer in use**.

### Migration Status

✅ **All drama analysis functionality has been migrated to the backend**

The drama analysis agents have been completely migrated to the backend as part of the multi-agent architecture upgrade. The frontend now communicates with the backend API endpoints instead of running agents locally.

### What Changed

**Old Architecture (Deprecated):**
```
Frontend (Browser) → Local Agents → Gemini API
```

**New Architecture (Current):**
```
Frontend → Backend API → Multi-Agent Orchestrator → Gemini API
                      ↓
                WebSocket (Real-time Updates)
```

### Why This Change?

1. **Better Performance**: Backend agents run on the server with better resources
2. **Security**: API keys stay on the server, never exposed to client
3. **Scalability**: Can handle concurrent analysis requests
4. **Real-time Updates**: WebSocket provides live progress updates
5. **Background Processing**: Long-running tasks don't block the UI

### What to Use Instead

**For Drama Analysis:**
```typescript
import { runSevenStationsAnalysis } from '@/lib/api';
import { websocketClient } from '@/lib/services/websocket-client';

// Start analysis
const result = await runSevenStationsAnalysis(scriptText, true);
const jobId = result.data.jobId;

// Listen for progress
websocketClient.onJobProgress((data) => {
  console.log(`Progress: ${data.progress}% - ${data.message}`);
});

// Listen for completion
websocketClient.onJobCompleted((data) => {
  console.log('Analysis complete:', data);
});
```

### Removal Timeline

This archived code is kept for reference only and will be removed in a future cleanup. 

**DO NOT:**
- Import anything from this directory
- Modify any files in this directory  
- Reference this code in new implementations

**DO:**
- Use the new backend API endpoints
- Use the WebSocket client for real-time updates
- Refer to the backend multi-agent documentation

### Migration Documentation

For detailed migration information, see:
- `/backend/src/services/agents/` - New multi-agent implementation
- `/docs/BACKEND_AGENTS_MIGRATION.md` - Migration guide
- `/backend/docs/MULTI_AGENT_ARCHITECTURE.md` - Architecture documentation

---

**Last Active**: December 2025  
**Deprecated On**: December 23, 2025  
**Migration PR**: #56 - Migrate agents to backend

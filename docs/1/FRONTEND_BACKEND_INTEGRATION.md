# Frontend-Backend Integration Guide

## Overview

This document describes the integration between the frontend and backend for the Drama Analysis Platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌────────────┐      ┌──────────────┐     ┌──────────────┐ │
│  │    UI      │ ───> │  API Client  │ ───>│   WebSocket  │ │
│  │ Components │      │  (api.ts)    │     │    Client    │ │
│  └────────────┘      └──────────────┘     └──────────────┘ │
└───────────────────────────│──────────────────────│──────────┘
                            │                      │
                         HTTP/REST            WebSocket
                            │                      │
┌───────────────────────────▼──────────────────────▼──────────┐
│                        BACKEND                               │
│  ┌────────────┐      ┌──────────────┐     ┌──────────────┐ │
│  │    API     │      │ Multi-Agent  │     │   WebSocket  │ │
│  │ Controllers│ ───> │ Orchestrator │ ──> │   Service    │ │
│  └────────────┘      └──────────────┘     └──────────────┘ │
│                            │                                 │
│                            ▼                                 │
│                     ┌──────────────┐                        │
│                     │   Database   │                        │
│                     │  (Postgres)  │                        │
│                     └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## API Integration

### 1. Seven Stations Analysis

**Frontend:**
```typescript
import { runSevenStationsAnalysis } from '@/lib/api';

// Start analysis (async mode)
const result = await runSevenStationsAnalysis(scriptText, true);
const jobId = result.data.jobId;

// Start analysis (sync mode - waits for completion)
const result = await runSevenStationsAnalysis(scriptText, false);
const report = result.data.report;
```

**Backend Endpoint:**
```
POST /api/analysis/seven-stations
Body: { text: string, async: boolean }
```

### 2. Job Status Tracking

**Frontend:**
```typescript
import { getAnalysisJobStatus } from '@/lib/api';

const status = await getAnalysisJobStatus(jobId);
console.log(status.data.state); // 'active', 'completed', 'failed'
```

**Backend Endpoint:**
```
GET /api/queue/jobs/:jobId
```

## WebSocket Integration

### Connection

The WebSocket client automatically connects on app initialization:

```typescript
import { websocketClient } from '@/lib/services/websocket-client';

// Check connection status
if (websocketClient.isConnected()) {
  console.log('Connected to backend');
}
```

### Real-time Progress Updates

#### Agent Progress

```typescript
import { websocketClient } from '@/lib/services/websocket-client';

// Subscribe to agent progress
const unsubscribe = websocketClient.onAgentProgress((data) => {
  console.log(`Agent: ${data.agentName}`);
  console.log(`Progress: ${data.progress}%`);
  console.log(`Message: ${data.message}`);
});

// Unsubscribe when done
unsubscribe();
```

#### Job Progress

```typescript
websocketClient.onJobProgress((data) => {
  console.log(`Job ${data.jobId}: ${data.progress}%`);
  if (data.currentStep) {
    console.log(`Current step: ${data.currentStep}`);
  }
});
```

#### Job Completion

```typescript
websocketClient.onJobCompleted((data) => {
  console.log('Analysis completed!', data);
  // Fetch final results
  const results = await getAnalysisJobStatus(data.jobId);
});
```

#### Job Failure

```typescript
websocketClient.onJobFailed((data) => {
  console.error('Analysis failed:', data.error);
});
```

### Joining Rooms

For job-specific updates:

```typescript
// Join a room to receive updates for a specific job
websocketClient.joinRoom(`job:${jobId}`);

// Leave the room when done
websocketClient.leaveRoom(`job:${jobId}`);
```

## Example: Complete Analysis Flow

```typescript
'use client';

import { useState, useEffect } from 'react';
import { runSevenStationsAnalysis } from '@/lib/api';
import { websocketClient } from '@/lib/services/websocket-client';

export function AnalysisComponent() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Subscribe to progress updates
    const unsubProgress = websocketClient.onJobProgress((data) => {
      setProgress(data.progress);
      setCurrentStep(data.currentStep || '');
    });

    const unsubComplete = websocketClient.onJobCompleted((data) => {
      setResult(data.result);
      setIsAnalyzing(false);
      setProgress(100);
    });

    const unsubFailed = websocketClient.onJobFailed((data) => {
      console.error('Analysis failed:', data);
      setIsAnalyzing(false);
    });

    // Cleanup
    return () => {
      unsubProgress();
      unsubComplete();
      unsubFailed();
    };
  }, []);

  const handleAnalyze = async (scriptText: string) => {
    try {
      setIsAnalyzing(true);
      setProgress(0);
      setResult(null);

      // Start async analysis
      const response = await runSevenStationsAnalysis(scriptText, true);
      const jobId = response.data.jobId;

      // Join the job's room for real-time updates
      websocketClient.joinRoom(`job:${jobId}`);

      console.log(`Analysis started with job ID: ${jobId}`);
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleAnalyze('Your script text here')}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Script'}
      </button>

      {isAnalyzing && (
        <div>
          <div>Progress: {progress}%</div>
          <div>Current Step: {currentStep}</div>
        </div>
      )}

      {result && (
        <div>
          <h2>Analysis Complete!</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

### Frontend (.env.local)

```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Optional: WebSocket URL (defaults to BACKEND_URL)
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Backend (.env)

```bash
# Gemini API Key (NEVER expose in frontend!)
GEMINI_API_KEY=your_api_key_here

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB (if used)
MONGODB_URI=mongodb://...
```

## Security Considerations

### ✅ DO

- Keep all API keys in backend .env files
- Use authentication middleware for protected routes
- Validate all user inputs on backend
- Use CORS properly
- Implement rate limiting

### ❌ DON'T

- Never expose GEMINI_API_KEY in frontend code
- Never trust client-side validation alone
- Never commit .env files to git
- Never expose sensitive data in WebSocket messages

## Type Safety

Types are shared between frontend and backend:

```typescript
// Backend: backend/src/types/realtime.types.ts
export interface JobProgressPayload {
  jobId: string;
  progress: number;
  currentStep?: string;
  message?: string;
}

// Frontend: frontend/src/lib/services/websocket-client.ts
// Same interface definition for type safety
```

## Testing the Integration

### 1. Start Backend

```bash
cd backend
npm run dev
# Backend should start on http://localhost:3001
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
# Frontend should start on http://localhost:5000
```

### 3. Test WebSocket Connection

Open browser console and check for:
```
[WebSocket] Connected
```

### 4. Test Analysis

```javascript
// In browser console
const result = await fetch('http://localhost:3001/api/analysis/seven-stations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    text: 'Test script content', 
    async: true 
  })
});
console.log(await result.json());
```

## Troubleshooting

### WebSocket Not Connecting

1. Check backend is running
2. Verify CORS settings in backend
3. Check firewall/network settings
4. Verify WebSocket URL is correct

### Analysis Not Starting

1. Check authentication token
2. Verify Redis is running (for job queue)
3. Check backend logs for errors
4. Verify Gemini API key is set

### Progress Updates Not Received

1. Verify WebSocket connection
2. Check if joined correct room
3. Verify backend is emitting events
4. Check browser console for errors

## Migration from Old Architecture

The old frontend agents (`frontend/src/lib/drama-analyst`) have been archived to `frontend/src/lib/_archived_drama-analyst`.

**Old way (deprecated):**
```typescript
import { DramaAnalyst } from '@/lib/drama-analyst';
const analyst = new DramaAnalyst();
const result = await analyst.analyze(script);
```

**New way (current):**
```typescript
import { runSevenStationsAnalysis } from '@/lib/api';
import { websocketClient } from '@/lib/services/websocket-client';

const response = await runSevenStationsAnalysis(script, true);
websocketClient.onJobProgress((data) => {
  console.log(`Progress: ${data.progress}%`);
});
```

## Additional Resources

- Backend API Documentation: `/backend/docs/API.md`
- Multi-Agent Architecture: `/backend/docs/MULTI_AGENT_ARCHITECTURE.md`
- WebSocket Events Reference: `/backend/src/types/realtime.types.ts`

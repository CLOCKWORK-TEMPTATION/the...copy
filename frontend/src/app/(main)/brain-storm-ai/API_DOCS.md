# 📡 Brain Storm AI - API Documentation

## Endpoint

```
POST /api/brainstorm
```

## Request

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "task": "تحليل الفكرة: [وصف الفكرة]",
  "context": {
    "brief": "[نص الفكرة الكامل]",
    "phase": 1,
    "sessionId": "session-123456789"
  },
  "agentIds": [
    "analysis-agent",
    "character-deep-analyzer",
    "dialogue-advanced-analyzer"
  ]
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task` | string | Yes | المهمة المطلوب من الوكلاء تنفيذها |
| `context` | object | No | سياق إضافي (brief, phase, sessionId) |
| `agentIds` | string[] | Yes | قائمة بمعرفات الوكلاء المشاركين |

## Response

### Success Response (200)
```json
{
  "success": true,
  "result": {
    "proposals": [
      {
        "agentId": "analysis-agent",
        "content": "[تحليل الوكيل]",
        "confidence": 0.95,
        "reasoning": "[التبرير]"
      }
    ],
    "consensus": {
      "decision": "[القرار النهائي]",
      "confidence": 0.92,
      "dissenting": []
    },
    "metrics": {
      "totalRounds": 2,
      "convergenceRate": 0.88
    }
  }
}
```

### Error Response (400)
```json
{
  "error": "Missing required fields: task, agentIds"
}
```

### Error Response (500)
```json
{
  "error": "Failed to conduct debate",
  "details": "[error message]"
}
```

## Available Agents

### Analysis Agents (18)
- `analysis-agent`
- `character-deep-analyzer`
- `character-network`
- `character-voice`
- `dialogue-advanced-analyzer`
- `dialogue-forensics`
- `conflict-dynamics`
- `cultural-historical-analyzer`
- `literary-quality-analyzer`
- `plot-predictor`
- `producibility-analyzer`
- `rhythm-mapping`
- `target-audience-analyzer`
- `thematic-mining`
- `themes-messages-analyzer`
- `visual-cinematic-analyzer`
- `style-fingerprint`
- `recommendations-generator`

### Generation Agents (5)
- `completion-agent`
- `creative-agent`
- `scene-generator`
- `world-builder`
- `recommendations-generator`

### Evaluation Agents (2)
- `audience-resonance`
- `tension-optimizer`

### Transformation Agents (3)
- `adaptive-rewriting`
- `platform-adapter`
- `style-fingerprint`

## Example Usage

### JavaScript/TypeScript
```typescript
const response = await fetch('/api/brainstorm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    task: 'تحليل الفكرة: فيلم درامي عن طبيبة',
    context: {
      brief: 'فيلم درامي عن طبيبة شابة...',
      phase: 1,
      sessionId: 'session-123'
    },
    agentIds: [
      'analysis-agent',
      'character-deep-analyzer'
    ]
  })
});

const data = await response.json();
console.log(data.result);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/brainstorm \
  -H "Content-Type: application/json" \
  -d '{
    "task": "تحليل الفكرة",
    "agentIds": ["analysis-agent"]
  }'
```

## Rate Limits

Depends on your Google Gemini API quota:
- Free tier: 60 requests/minute
- Check your quota at: https://makersuite.google.com/app/apikey

## Error Handling

```typescript
try {
  const response = await fetch('/api/brainstorm', {...});
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Network error:', error);
}
```

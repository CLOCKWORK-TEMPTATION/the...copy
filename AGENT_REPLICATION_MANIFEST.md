# AGENT FILES REPLICATION MANIFEST

## Completed Files (Phase 1)

### JSON Instruction Files (25/25) ✅
All JSON instruction files have been successfully replicated to:
`backend/public/agents/instructions/`

1. adaptive-rewriting.json
2. analysis.json
3. audience-resonance.json
4. character-analyzer.json
5. character-deep-analyzer.json
6. character-network.json
7. character-voice.json
8. conflict-dynamics.json
9. creative.json
10. cultural-historical-analyzer.json
11. dialogue-advanced-analyzer.json
12. dialogue-forensics.json
13. integrated.json
14. literary-quality-analyzer.json
15. platform-adapter.json
16. plot-predictor.json
17. producibility-analyzer.json
18. recommendations-generator.json
19. style-fingerprint.json
20. target-audience-analyzer.json
21. tension-optimizer.json
22. thematic-mining.json
23. themes-messages-analyzer.json
24. visual-cinematic-analyzer.json
25. world-builder.json

### Core Service Files (3/3) ✅
Replicated to: `backend/src/services/`

1. AnalysisService.ts
2. instructions-loader.ts  
3. agent-instructions.ts

## Remaining Files (Phase 2)

### Agent Core Files
Location: `backend/src/services/agents/core/`
- fileReaderService.ts
- geminiService.ts
- index.ts
- integratedAgent.ts
- integratedAgentConfig.ts

### Agent Analysis Files (18 files)
Location: `backend/src/services/agents/analysis/`
- analysisAgent.ts
- characterDeepAnalyzerAgent.ts
- characterDeepAnalyzerConfig.ts
- characterNetworkAgent.ts
- characterVoiceAgent.ts
- config.ts
- conflictDynamicsAgent.ts
- culturalHistoricalAnalyzerAgent.ts
- dialogueAdvancedAnalyzerAgent.ts
- dialogueForensicsAgent.ts
- literaryQualityAnalyzerAgent.ts
- plotPredictorAgent.ts
- producibilityAnalyzerAgent.ts
- rhythmMappingAgent.ts
- targetAudienceAnalyzerAgent.ts
- thematicMiningAgent.ts
- themesMessagesAnalyzerAgent.ts
- visualCinematicAnalyzerAgent.ts

### Agent Evaluation Files (2 files)
Location: `backend/src/services/agents/evaluation/`
- audienceResonanceAgent.ts
- tensionOptimizerAgent.ts

### Agent Generation Files (5 files)
Location: `backend/src/services/agents/generation/`
- completionAgent.ts
- creativeAgent.ts
- recommendationsGeneratorAgent.ts
- sceneGeneratorAgent.ts
- worldBuilderAgent.ts

### Agent Transformation Files (3 files)
Location: `backend/src/services/agents/transformation/`
- adaptiveRewritingAgent.ts
- platformAdapterAgent.ts
- styleFingerprintAgent.ts

### Agent Instruction TypeScript Files (28 files)
Location: `backend/src/services/agents/instructions/`
- adaptive_rewriting_instructions.ts
- analysis_instructions.ts
- audience_resonance_instructions.ts
- character_deep_analyzer_instructions.ts
- character_network_instructions.ts
- character_voice_instructions.ts
- completion_instructions.ts
- conflict_dynamics_instructions.ts
- creative_instructions.ts
- cultural_historical_analyzer_instructions.ts
- dialogue_advanced_analyzer_instructions.ts
- dialogue_forensics_instructions.ts
- integrated_instructions.ts
- literary_quality_analyzer_instructions.ts
- platform_adapter_instructions.ts
- plot_predictor_instructions.ts
- producibility_analyzer_instructions.ts
- prompts.ts
- recommendations_generator_instructions.ts
- rhythm_mapping_instructions.ts
- scene_generator_instructions.ts
- style_fingerprint_instructions.ts
- target_audience_analyzer_instructions.ts
- tension_optimizer_instructions.ts
- thematic_mining_instructions.ts
- themes_messages_analyzer_instructions.ts
- visual_cinematic_analyzer_instructions.ts
- world_builder_instructions.ts

## Integration Notes

### Import Path Adaptations Required
- Frontend paths: `@/...` → Backend relative paths: `../../../...`
- Service imports need to reference backend structure
- Type imports should reference backend type definitions

### Dependencies to Install
```bash
pnpm --filter @the-copy/backend add @google/generative-ai mammoth
```

### Environment Variables Required
- `GOOGLE_GENAI_API_KEY` - For Gemini AI service
- Redis connection for agent state management
- PostgreSQL for agent data persistence

### Backend Express Integration Points
1. Create agent routes in `backend/src/routes/agents.ts`
2. Add agent controller in `backend/src/controllers/agentsController.ts`
3. Connect to existing geminiService or create new instance
4. Integrate with existing BullMQ queues for async processing

## Next Steps

1. Complete core agent files replication
2. Replicate all analysis agent files
3. Replicate evaluation, generation, and transformation agents
4. Replicate instruction TypeScript files
5. Create integration routes and controllers
6. Add comprehensive tests
7. Update backend documentation

## File Count Summary
- Completed: 28 files
- Remaining: ~59 TypeScript files
- Total: 87 files

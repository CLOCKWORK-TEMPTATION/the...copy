'use client';

/**
 * RAG Configuration Panel
 * UI for configuring semantic chunking and RAG settings
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export interface RAGConfig {
  enableSemanticRAG: boolean;
  maxChunks: number;
  minRelevanceScore: number;
  chunkSize: number;
  coherenceThreshold: number;
  enableReranking: boolean;
}

interface RAGConfigPanelProps {
  config: RAGConfig;
  onChange: (config: RAGConfig) => void;
  embeddingsMetrics?: {
    cacheSize: number;
    cacheHitRate: number;
  };
}

export function RAGConfigPanel({
  config,
  onChange,
  embeddingsMetrics,
}: RAGConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<RAGConfig>(config);

  const handleChange = (updates: Partial<RAGConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات RAG</CardTitle>
          <CardDescription>
            تكوين نظام الاسترجاع المعزز للتوليد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Semantic RAG Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="semantic-rag">
                RAG الدلالي
              </Label>
              <p className="text-sm text-muted-foreground">
                استخدام التضمينات الدلالية بدلاً من المطابقة بالكلمات المفتاحية
              </p>
            </div>
            <Switch
              id="semantic-rag"
              checked={localConfig.enableSemanticRAG}
              onCheckedChange={(checked) =>
                handleChange({ enableSemanticRAG: checked })
              }
            />
          </div>

          {/* Reranking Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reranking">
                إعادة الترتيب
              </Label>
              <p className="text-sm text-muted-foreground">
                تحسين ترتيب النتائج باستخدام إشارات إضافية
              </p>
            </div>
            <Switch
              id="reranking"
              checked={localConfig.enableReranking}
              onCheckedChange={(checked) =>
                handleChange({ enableReranking: checked })
              }
            />
          </div>

          {/* Max Chunks Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-chunks">
                الحد الأقصى للأجزاء
              </Label>
              <Badge variant="secondary">{localConfig.maxChunks}</Badge>
            </div>
            <Slider
              id="max-chunks"
              min={1}
              max={10}
              step={1}
              value={[localConfig.maxChunks]}
              onValueChange={(value) =>
                handleChange({ maxChunks: value[0] })
              }
            />
            <p className="text-xs text-muted-foreground">
              عدد الأجزاء ذات الصلة التي يتم استرجاعها
            </p>
          </div>

          {/* Relevance Score Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="relevance-score">
                الحد الأدنى للملاءمة
              </Label>
              <Badge variant="secondary">
                {(localConfig.minRelevanceScore * 100).toFixed(0)}%
              </Badge>
            </div>
            <Slider
              id="relevance-score"
              min={0.3}
              max={0.95}
              step={0.05}
              value={[localConfig.minRelevanceScore]}
              onValueChange={(value) =>
                handleChange({ minRelevanceScore: value[0] })
              }
            />
            <p className="text-xs text-muted-foreground">
              درجة التشابه الدنيا المطلوبة للأجزاء
            </p>
          </div>

          {/* Chunk Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="chunk-size">
                حجم الجزء
              </Label>
              <Badge variant="secondary">{localConfig.chunkSize}</Badge>
            </div>
            <Slider
              id="chunk-size"
              min={200}
              max={1500}
              step={100}
              value={[localConfig.chunkSize]}
              onValueChange={(value) =>
                handleChange({ chunkSize: value[0] })
              }
            />
            <p className="text-xs text-muted-foreground">
              الحد الأقصى لعدد الأحرف في كل جزء
            </p>
          </div>

          {/* Coherence Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="coherence-threshold">
                عتبة الترابط
              </Label>
              <Badge variant="secondary">
                {(localConfig.coherenceThreshold * 100).toFixed(0)}%
              </Badge>
            </div>
            <Slider
              id="coherence-threshold"
              min={0.3}
              max={0.9}
              step={0.05}
              value={[localConfig.coherenceThreshold]}
              onValueChange={(value) =>
                handleChange({ coherenceThreshold: value[0] })
              }
            />
            <p className="text-xs text-muted-foreground">
              الحد الأدنى للترابط الدلالي بين الجمل
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Embeddings Metrics */}
      {embeddingsMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>مقاييس التضمينات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                حجم التخزين المؤقت
              </span>
              <Badge>{embeddingsMetrics.cacheSize}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                معدل إصابة الذاكرة المؤقتة
              </span>
              <Badge variant="outline">
                {(embeddingsMetrics.cacheHitRate * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                localConfig.enableSemanticRAG
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-sm font-medium">
              {localConfig.enableSemanticRAG
                ? 'RAG دلالي نشط'
                : 'RAG بالكلمات المفتاحية'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

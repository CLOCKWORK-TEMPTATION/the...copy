'use client';

/**
 * RAG Performance Dashboard
 * Displays precision/recall metrics, performance comparisons, and chunk visualizations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface RAGMetrics {
  totalChunks: number;
  retrievedChunks: number;
  avgRelevanceScore: number;
  precision: number;
  recall: number;
  processingTimeMs: number;
}

export interface ChunkInfo {
  text: string;
  relevanceScore: number;
  rank: number;
  coherenceScore: number;
}

interface RAGDashboardProps {
  metrics?: RAGMetrics;
  chunks?: ChunkInfo[];
  comparisonMetrics?: {
    semantic: RAGMetrics;
    keyword: RAGMetrics;
  };
}

export function RAGDashboard({
  metrics,
  chunks,
  comparisonMetrics,
}: RAGDashboardProps) {
  const [selectedChunk, setSelectedChunk] = useState<number | null>(null);

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">المقاييس</TabsTrigger>
          <TabsTrigger value="chunks">الأجزاء</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {metrics ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>مقاييس الأداء</CardTitle>
                  <CardDescription>
                    إحصائيات استرجاع الأجزاء ذات الصلة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Precision */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">الدقة (Precision)</span>
                      <Badge variant={getScoreBadgeVariant(metrics.precision)}>
                        {(metrics.precision * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={metrics.precision * 100} />
                    <p className="text-xs text-muted-foreground">
                      نسبة الأجزاء المسترجعة ذات الصلة العالية
                    </p>
                  </div>

                  {/* Recall */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">الاستدعاء (Recall)</span>
                      <Badge variant={getScoreBadgeVariant(metrics.recall)}>
                        {(metrics.recall * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={metrics.recall * 100} />
                    <p className="text-xs text-muted-foreground">
                      نسبة الأجزاء ذات الصلة التي تم استرجاعها
                    </p>
                  </div>

                  {/* Average Relevance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">متوسط الملاءمة</span>
                      <Badge variant="outline">
                        {(metrics.avgRelevanceScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={metrics.avgRelevanceScore * 100} />
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">إجمالي الأجزاء</p>
                      <p className="text-2xl font-bold">{metrics.totalChunks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">الأجزاء المسترجعة</p>
                      <p className="text-2xl font-bold">{metrics.retrievedChunks}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">وقت المعالجة</p>
                      <p className="text-lg font-semibold">
                        {metrics.processingTimeMs.toFixed(0)} ms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  لا توجد مقاييس متاحة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chunks Tab */}
        <TabsContent value="chunks" className="space-y-4">
          {chunks && chunks.length > 0 ? (
            <div className="space-y-3">
              {chunks.map((chunk, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    selectedChunk === index ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedChunk(index === selectedChunk ? null : index)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        جزء #{chunk.rank}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          ملاءمة: {(chunk.relevanceScore * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="secondary">
                          ترابط: {(chunk.coherenceScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {chunk.text}
                    </p>
                    {selectedChunk === index && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm">{chunk.text}</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">درجة الملاءمة</span>
                            <Progress
                              value={chunk.relevanceScore * 100}
                              className="w-32 h-2"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">درجة الترابط</span>
                            <Progress
                              value={chunk.coherenceScore * 100}
                              className="w-32 h-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  لا توجد أجزاء متاحة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {comparisonMetrics ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>مقارنة الأداء</CardTitle>
                  <CardDescription>
                    RAG الدلالي مقابل RAG بالكلمات المفتاحية
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Precision Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">الدقة (Precision)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">RAG دلالي</span>
                        <Badge>{(comparisonMetrics.semantic.precision * 100).toFixed(0)}%</Badge>
                      </div>
                      <Progress value={comparisonMetrics.semantic.precision * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">RAG كلمات مفتاحية</span>
                        <Badge variant="outline">
                          {(comparisonMetrics.keyword.precision * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress
                        value={comparisonMetrics.keyword.precision * 100}
                        className="opacity-60"
                      />
                    </div>
                  </div>

                  {/* Recall Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">الاستدعاء (Recall)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">RAG دلالي</span>
                        <Badge>{(comparisonMetrics.semantic.recall * 100).toFixed(0)}%</Badge>
                      </div>
                      <Progress value={comparisonMetrics.semantic.recall * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">RAG كلمات مفتاحية</span>
                        <Badge variant="outline">
                          {(comparisonMetrics.keyword.recall * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress
                        value={comparisonMetrics.keyword.recall * 100}
                        className="opacity-60"
                      />
                    </div>
                  </div>

                  {/* Processing Time Comparison */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">وقت المعالجة</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">RAG دلالي</p>
                        <p className="text-lg font-semibold">
                          {comparisonMetrics.semantic.processingTimeMs.toFixed(0)} ms
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">RAG كلمات</p>
                        <p className="text-lg font-semibold">
                          {comparisonMetrics.keyword.processingTimeMs.toFixed(0)} ms
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Winner Summary */}
              <Card>
                <CardContent className="pt-6">
                  {comparisonMetrics.semantic.precision > comparisonMetrics.keyword.precision ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">✓</Badge>
                      <span className="text-sm">
                        RAG الدلالي يتفوق بدقة أعلى بنسبة{' '}
                        {(
                          (comparisonMetrics.semantic.precision - comparisonMetrics.keyword.precision) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">→</Badge>
                      <span className="text-sm">
                        الأداء متقارب بين النظامين
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  لا توجد بيانات مقارنة متاحة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

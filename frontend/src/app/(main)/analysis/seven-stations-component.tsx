"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, CheckCircle, AlertCircle, Users, TrendingUp, Network, FileText, Sparkles } from "lucide-react";

interface AnalysisResult {
  success: boolean;
  station1: any;
  flows: {
    charactersRelationships?: { characters: string[]; relationships: string[] };
    themesGenres?: { themes: string[]; genres: string[] };
    efficiency?: { efficiencyScore: number; effectivenessAnalysis: string };
    conflictNetwork?: { conflictNetworkJson: string };
  };
  rag: {
    needsChunking: boolean;
    chunks: Array<{ id: string; content: string; startIndex: number; endIndex: number }>;
    summary: string;
    metadata?: any;
  };
  metadata: {
    stationName: string;
    stationNumber: number;
    status: string;
    executionTime: number;
    agentsUsed: string[];
    tokensUsed: number;
    features: {
      station1: boolean;
      flows: boolean;
      rag: boolean;
    };
  };
}

export default function SevenStationsComponent() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("يرجى إدخال نص للتحليل");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analysis/seven-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, enableFlows: true, enableRAG: true }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في التحليل");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            نظام المحطات السبع للتحليل الدرامي
          </CardTitle>
          <CardDescription>
            تحليل متقدم للسيناريو عبر 7 محطات متتابعة مع دعم Flows و RAG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              نص السيناريو
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أدخل نص السيناريو هنا..."
              className="min-h-[200px]"
              disabled={isAnalyzing}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                جاري التحليل عبر المحطات السبع...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                بدء التحليل الشامل
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-600 font-medium">تم التحليل بنجاح!</p>
              </div>

              {/* المحطة 1: التحليل النصي الأساسي */}
              {result.station1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary">المحطة 1</Badge>
                      التحليل النصي الأساسي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1">Logline:</h5>
                      <p className="text-sm text-muted-foreground">{result.station1.logline}</p>
                    </div>
                    {result.station1.majorCharacters?.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-1">الشخصيات الرئيسية:</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.station1.majorCharacters.map((char: string, i: number) => (
                            <Badge key={i} variant="outline">{char}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Flows Results */}
              {result.flows && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      تحليل Flows المتقدم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* الشخصيات والعلاقات */}
                    {result.flows.charactersRelationships && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          الشخصيات والعلاقات
                        </h5>
                        {result.flows.charactersRelationships.characters?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">الشخصيات:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.flows.charactersRelationships.characters.map((char: string, i: number) => (
                                <Badge key={i} variant="secondary">{char}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.flows.charactersRelationships.relationships?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">العلاقات:</p>
                            <ul className="text-xs space-y-1">
                              {result.flows.charactersRelationships.relationships.map((rel: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {rel}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* المواضيع والأنواع */}
                    {result.flows.themesGenres && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          المواضيع والأنواع
                        </h5>
                        {result.flows.themesGenres.themes?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">المواضيع:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.flows.themesGenres.themes.map((theme: string, i: number) => (
                                <Badge key={i} variant="secondary">{theme}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.flows.themesGenres.genres?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">الأنواع:</p>
                            <div className="flex flex-wrap gap-1">
                              {result.flows.themesGenres.genres.map((genre: string, i: number) => (
                                <Badge key={i} variant="outline">{genre}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* الكفاءة والفعالية */}
                    {result.flows.efficiency && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          الكفاءة والفعالية
                        </h5>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${result.flows.efficiency.efficiencyScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{result.flows.efficiency.efficiencyScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.flows.efficiency.effectivenessAnalysis}</p>
                      </div>
                    )}

                    {/* شبكة الصراع */}
                    {result.flows.conflictNetwork && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          شبكة الصراع
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          تم توليد شبكة الصراع بنجاح. البيانات متاحة بصيغة JSON.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* RAG Results */}
              {result.rag && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      تحليل RAG (للنصوص الطويلة)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={result.rag.needsChunking ? "default" : "secondary"}>
                          {result.rag.needsChunking ? "تم التقسيم" : "لا يحتاج تقسيم"}
                        </Badge>
                      </div>
                      {result.rag.needsChunking && result.rag.chunks?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            عدد الأجزاء: {result.rag.chunks.length}
                          </p>
                          <div className="space-y-1">
                            {result.rag.chunks.map((chunk, i) => (
                              <div key={chunk.id} className="text-xs p-2 bg-background rounded">
                                <span className="font-medium">جزء {i + 1}:</span> {chunk.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">الملخص:</p>
                        <p className="text-xs text-muted-foreground">{result.rag.summary}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* بيانات الوصفية */}
              {result.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">بيانات الوصفية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">الحالة</p>
                        <p className="font-medium">{result.metadata.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">وقت التنفيذ</p>
                        <p className="font-medium">{result.metadata.executionTime}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">التوكنز</p>
                        <p className="font-medium">{result.metadata.tokensUsed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الوكلاء</p>
                        <p className="font-medium">{result.metadata.agentsUsed?.join(", ")}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">الميزات المفعلة:</p>
                      <div className="flex gap-2">
                        <Badge variant={result.metadata.features.station1 ? "default" : "secondary"}>
                          Station 1
                        </Badge>
                        <Badge variant={result.metadata.features.flows ? "default" : "secondary"}>
                          Flows
                        </Badge>
                        <Badge variant={result.metadata.features.rag ? "default" : "secondary"}>
                          RAG
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

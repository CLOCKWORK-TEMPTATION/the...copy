"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Users,
  Lightbulb,
} from "lucide-react";
import { DebateArgument, DebateSession } from "./DebateViewer";

// =====================================================
// Types
// =====================================================

interface InteractiveDebateProps {
  topic?: string;
  availableAgents?: string[];
  onStartDebate?: (config: DebateConfig) => void;
  onAddUserArgument?: (argument: UserArgument) => void;
  onPauseDebate?: () => void;
  onResumeDebate?: () => void;
  onResetDebate?: () => void;
  currentSession?: DebateSession;
  isDebating?: boolean;
}

interface DebateConfig {
  topic: string;
  maxRounds: number;
  minParticipants: number;
  maxParticipants: number;
  consensusThreshold: number;
  selectedAgents?: string[];
  allowUserInput: boolean;
}

interface UserArgument {
  position: string;
  reasoning?: string;
  supportingEvidence?: string[];
}

// =====================================================
// Component
// =====================================================

/**
 * InteractiveDebate Component
 * مناظرة تفاعلية مع إمكانية إضافة حجج المستخدم
 */
export function InteractiveDebate({
  topic: initialTopic = '',
  availableAgents = [],
  onStartDebate,
  onAddUserArgument,
  onPauseDebate,
  onResumeDebate,
  onResetDebate,
  currentSession,
  isDebating = false,
}: InteractiveDebateProps) {
  // Configuration state
  const [config, setConfig] = useState<DebateConfig>({
    topic: initialTopic,
    maxRounds: 3,
    minParticipants: 2,
    maxParticipants: 5,
    consensusThreshold: 0.75,
    selectedAgents: [],
    allowUserInput: true,
  });

  // User argument state
  const [userArgument, setUserArgument] = useState<UserArgument>({
    position: '',
    reasoning: '',
    supportingEvidence: [],
  });

  const [evidenceInput, setEvidenceInput] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'config' | 'debate' | 'input'>('config');

  const handleStartDebate = () => {
    if (config.topic.trim() && onStartDebate) {
      onStartDebate(config);
      setActiveTab('debate');
    }
  };

  const handleAddUserArgument = () => {
    if (userArgument.position.trim() && onAddUserArgument) {
      onAddUserArgument(userArgument);

      // Reset form
      setUserArgument({
        position: '',
        reasoning: '',
        supportingEvidence: [],
      });
      setEvidenceInput('');
    }
  };

  const handleAddEvidence = () => {
    if (evidenceInput.trim()) {
      setUserArgument(prev => ({
        ...prev,
        supportingEvidence: [...(prev.supportingEvidence || []), evidenceInput],
      }));
      setEvidenceInput('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setUserArgument(prev => ({
      ...prev,
      supportingEvidence: prev.supportingEvidence?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="w-6 h-6 text-primary" />
                مناظرة تفاعلية
              </CardTitle>
              {config.topic && (
                <CardDescription className="text-base">{config.topic}</CardDescription>
              )}
            </div>

            {/* Control Buttons */}
            {isDebating && (
              <div className="flex items-center gap-2">
                {onPauseDebate && (
                  <Button variant="outline" size="sm" onClick={onPauseDebate}>
                    <Pause className="w-4 h-4 ml-2" />
                    إيقاف مؤقت
                  </Button>
                )}
                {onResumeDebate && (
                  <Button variant="outline" size="sm" onClick={onResumeDebate}>
                    <Play className="w-4 h-4 ml-2" />
                    استئناف
                  </Button>
                )}
                {onResetDebate && (
                  <Button variant="destructive" size="sm" onClick={onResetDebate}>
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إعادة تعيين
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" disabled={isDebating}>
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </TabsTrigger>
          <TabsTrigger value="debate">
            <Users className="w-4 h-4 ml-2" />
            المناظرة
          </TabsTrigger>
          <TabsTrigger value="input" disabled={!config.allowUserInput || !isDebating}>
            <Lightbulb className="w-4 h-4 ml-2" />
            حجتي
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المناظرة</CardTitle>
              <CardDescription>قم بتكوين معايير المناظرة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic */}
              <div className="space-y-2">
                <label className="text-sm font-medium">موضوع المناظرة</label>
                <Input
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="أدخل موضوع المناظرة..."
                  className="text-base"
                />
              </div>

              {/* Number of Rounds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد الجولات</label>
                  <Select
                    value={config.maxRounds.toString()}
                    onValueChange={(v) => setConfig({ ...config, maxRounds: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">جولة واحدة</SelectItem>
                      <SelectItem value="2">جولتان</SelectItem>
                      <SelectItem value="3">3 جولات</SelectItem>
                      <SelectItem value="5">5 جولات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Consensus Threshold */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    عتبة التوافق ({(config.consensusThreshold * 100).toFixed(0)}%)
                  </label>
                  <Select
                    value={config.consensusThreshold.toString()}
                    onValueChange={(v) => setConfig({ ...config, consensusThreshold: parseFloat(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">50%</SelectItem>
                      <SelectItem value="0.6">60%</SelectItem>
                      <SelectItem value="0.7">70%</SelectItem>
                      <SelectItem value="0.75">75%</SelectItem>
                      <SelectItem value="0.8">80%</SelectItem>
                      <SelectItem value="0.9">90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الحد الأدنى للمشاركين</label>
                  <Select
                    value={config.minParticipants.toString()}
                    onValueChange={(v) => setConfig({ ...config, minParticipants: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الحد الأقصى للمشاركين</label>
                  <Select
                    value={config.maxParticipants.toString()}
                    onValueChange={(v) => setConfig({ ...config, maxParticipants: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Allow User Input */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowUserInput"
                  checked={config.allowUserInput}
                  onChange={(e) => setConfig({ ...config, allowUserInput: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="allowUserInput" className="text-sm font-medium cursor-pointer">
                  السماح بإضافة حجج المستخدم
                </label>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartDebate}
                disabled={!config.topic.trim()}
                className="w-full"
                size="lg"
              >
                <Play className="w-5 h-5 ml-2" />
                بدء المناظرة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debate Tab */}
        <TabsContent value="debate" className="space-y-4">
          {currentSession ? (
            <Card>
              <CardHeader>
                <CardTitle>سير المناظرة</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{currentSession.status}</Badge>
                  <Badge variant="outline">
                    جولة {currentSession.rounds.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {currentSession.rounds.map((round) => (
                      <div key={round.roundNumber} className="space-y-2">
                        <h4 className="font-medium text-sm">
                          الجولة {round.roundNumber}
                        </h4>
                        <div className="space-y-2">
                          {round.arguments.map((arg: DebateArgument) => (
                            <div
                              key={arg.id}
                              className="p-3 border rounded-lg bg-card text-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{arg.agentName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(arg.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">
                                {arg.position.substring(0, 150)}...
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لم تبدأ المناظرة بعد. قم بتكوين الإعدادات أولاً.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Input Tab */}
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أضف حجتك</CardTitle>
              <CardDescription>شارك برأيك وحججك في المناظرة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الموقف / الحجة</label>
                <Textarea
                  value={userArgument.position}
                  onChange={(e) => setUserArgument({ ...userArgument, position: e.target.value })}
                  placeholder="اكتب حجتك هنا..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <label className="text-sm font-medium">التبرير (اختياري)</label>
                <Textarea
                  value={userArgument.reasoning}
                  onChange={(e) => setUserArgument({ ...userArgument, reasoning: e.target.value })}
                  placeholder="اشرح تبريرك لهذا الموقف..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Evidence */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الأدلة الداعمة (اختياري)</label>
                <div className="flex gap-2">
                  <Input
                    value={evidenceInput}
                    onChange={(e) => setEvidenceInput(e.target.value)}
                    placeholder="أضف دليلاً..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEvidence();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddEvidence}>
                    إضافة
                  </Button>
                </div>

                {/* Evidence List */}
                {userArgument.supportingEvidence && userArgument.supportingEvidence.length > 0 && (
                  <ul className="space-y-2">
                    {userArgument.supportingEvidence.map((evidence, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
                      >
                        <span className="flex-1 text-sm">{evidence}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEvidence(idx)}
                        >
                          حذف
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAddUserArgument}
                disabled={!userArgument.position.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 ml-2" />
                إرسال الحجة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InteractiveDebate;

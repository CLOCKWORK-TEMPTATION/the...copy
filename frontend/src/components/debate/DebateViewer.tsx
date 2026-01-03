"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";

// =====================================================
// Types
// =====================================================

export interface DebateArgument {
  id: string;
  agentName: string;
  role: 'proposer' | 'opponent' | 'moderator' | 'synthesizer';
  position: string;
  reasoning: string;
  evidence: string[];
  confidence: number;
  timestamp: Date;
}

export interface DebateRound {
  roundNumber: number;
  arguments: DebateArgument[];
  consensus?: {
    achieved: boolean;
    agreementScore: number;
    consensusPoints: string[];
    disagreementPoints: string[];
  };
  status: 'active' | 'completed' | 'aborted';
  startTime: Date;
  endTime?: Date;
}

export interface DebateSession {
  id: string;
  topic: string;
  rounds: DebateRound[];
  status: 'initializing' | 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  finalResult?: {
    text: string;
    confidence: number;
    notes: string[];
  };
}

interface DebateViewerProps {
  session: DebateSession;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

// =====================================================
// Helper Functions
// =====================================================

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'proposer':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'opponent':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    case 'synthesizer':
      return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    case 'moderator':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    proposer: 'مقترح',
    opponent: 'معارض',
    synthesizer: 'موحّد',
    moderator: 'منسق',
  };
  return labels[role] || role;
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; color: string; icon: any }> = {
    initializing: { label: 'جاري التهيئة', color: 'bg-yellow-500/20 text-yellow-600', icon: Clock },
    in_progress: { label: 'جارية', color: 'bg-blue-500/20 text-blue-600', icon: MessageSquare },
    completed: { label: 'مكتملة', color: 'bg-green-500/20 text-green-600', icon: CheckCircle2 },
    failed: { label: 'فشلت', color: 'bg-red-500/20 text-red-600', icon: XCircle },
  };

  const { label, color, icon: Icon } = config[status] || config.completed;

  return (
    <Badge className={`${color} gap-1.5`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

// =====================================================
// Components
// =====================================================

/**
 * DebateViewer Component
 * عرض جلسات المناظرة
 */
export function DebateViewer({
  session,
  open,
  onOpenChange,
  trigger,
}: DebateViewerProps) {
  const [selectedRound, setSelectedRound] = useState<number>(0);

  const currentRound = session.rounds[selectedRound];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-6xl max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            جلسة المناظرة
          </DialogTitle>
          <DialogDescription className="text-base">
            {session.topic}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">معلومات الجلسة</CardTitle>
                {getStatusBadge(session.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">بدأت في:</span>
                <span>{formatTimestamp(session.startTime)}</span>
              </div>
              {session.endTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">انتهت في:</span>
                  <span>{formatTimestamp(session.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الجولات:</span>
                <span>{session.rounds.length}</span>
              </div>
              {session.finalResult && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الثقة النهائية:</span>
                  <Badge variant="outline">
                    {(session.finalResult.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rounds Tabs */}
          <Tabs
            value={`round-${selectedRound}`}
            onValueChange={(value) => {
              const roundNum = parseInt(value.replace('round-', ''));
              setSelectedRound(roundNum);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${session.rounds.length}, 1fr)` }}>
              {session.rounds.map((round, idx) => (
                <TabsTrigger key={idx} value={`round-${idx}`}>
                  الجولة {round.roundNumber}
                </TabsTrigger>
              ))}
            </TabsList>

            {session.rounds.map((round, idx) => (
              <TabsContent key={idx} value={`round-${idx}`} className="space-y-4">
                <RoundView round={round} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Final Result */}
          {session.finalResult && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  النتيجة النهائية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  <div className="prose prose-sm max-w-none" dir="rtl">
                    {session.finalResult.text}
                  </div>
                </ScrollArea>

                {session.finalResult.notes && session.finalResult.notes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">ملاحظات:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {session.finalResult.notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * RoundView Component
 * عرض جولة واحدة من المناظرة
 */
function RoundView({ round }: { round: DebateRound }) {
  return (
    <div className="space-y-4">
      {/* Round Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>بدأت: {formatTimestamp(round.startTime)}</span>
        {round.endTime && <span>انتهت: {formatTimestamp(round.endTime)}</span>}
      </div>

      {/* Arguments */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          الحجج ({round.arguments.length})
        </h4>

        <div className="space-y-3">
          {round.arguments.map((argument) => (
            <ArgumentCard key={argument.id} argument={argument} />
          ))}
        </div>
      </div>

      {/* Consensus */}
      {round.consensus && (
        <Card className={round.consensus.achieved ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {round.consensus.achieved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  تم التوصل إلى توافق
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                  لم يتم التوصل إلى توافق كامل
                </>
              )}
            </CardTitle>
            <CardDescription>
              درجة التوافق: {(round.consensus.agreementScore * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {round.consensus.consensusPoints.length > 0 && (
              <div>
                <p className="font-medium mb-2 text-green-700">نقاط التوافق:</p>
                <ul className="list-disc list-inside space-y-1">
                  {round.consensus.consensusPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {round.consensus.disagreementPoints.length > 0 && (
              <div>
                <p className="font-medium mb-2 text-red-700">نقاط الاختلاف:</p>
                <ul className="list-disc list-inside space-y-1">
                  {round.consensus.disagreementPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * ArgumentCard Component
 * عرض حجة واحدة
 */
function ArgumentCard({ argument }: { argument: DebateArgument }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{argument.agentName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getRoleBadgeColor(argument.role)}>
                {getRoleLabel(argument.role)}
              </Badge>
              <Badge variant="outline">
                ثقة: {(argument.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'إخفاء' : 'عرض المزيد'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="prose prose-sm max-w-none" dir="rtl">
          {expanded ? argument.position : `${argument.position.substring(0, 200)}...`}
        </div>

        {expanded && (
          <>
            {argument.reasoning && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">التبرير:</p>
                <p className="text-sm text-muted-foreground">{argument.reasoning}</p>
              </div>
            )}

            {argument.evidence.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-2">الأدلة:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {argument.evidence.map((evidence, idx) => (
                    <li key={idx}>{evidence}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          {formatTimestamp(argument.timestamp)}
        </div>
      </CardContent>
    </Card>
  );
}

export default DebateViewer;

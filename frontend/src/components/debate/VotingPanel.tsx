"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, BarChart3, Trophy, Star } from "lucide-react";
import { DebateArgument } from "./DebateViewer";

// =====================================================
// Types
// =====================================================

export interface Vote {
  argumentId: string;
  score: number; // 0-1
  reasoning?: string;
  voterId: string;
  timestamp: Date;
}

interface VotingPanelProps {
  arguments: DebateArgument[];
  onVoteSubmit?: (votes: Vote[]) => void;
  existingVotes?: Vote[];
  currentUserId?: string;
  readOnly?: boolean;
}

interface VoteState {
  argumentId: string;
  score: number;
}

// =====================================================
// Helper Functions
// =====================================================

function calculateVoteResults(
  arguments: DebateArgument[],
  votes: Vote[]
): Map<string, { totalScore: number; voteCount: number; averageScore: number }> {
  const results = new Map<string, { totalScore: number; voteCount: number; averageScore: number }>();

  // Initialize results for all arguments
  arguments.forEach(arg => {
    results.set(arg.id, { totalScore: 0, voteCount: 0, averageScore: 0 });
  });

  // Aggregate votes
  votes.forEach(vote => {
    const current = results.get(vote.argumentId);
    if (current) {
      current.totalScore += vote.score;
      current.voteCount += 1;
      current.averageScore = current.totalScore / current.voteCount;
    }
  });

  return results;
}

function getTopArguments(
  arguments: DebateArgument[],
  voteResults: Map<string, { totalScore: number; voteCount: number; averageScore: number }>
): DebateArgument[] {
  const sorted = [...arguments].sort((a, b) => {
    const scoreA = voteResults.get(a.id)?.averageScore || 0;
    const scoreB = voteResults.get(b.id)?.averageScore || 0;
    return scoreB - scoreA;
  });

  return sorted.slice(0, 3);
}

// =====================================================
// Components
// =====================================================

/**
 * VotingPanel Component
 * لوحة التصويت على الحجج
 */
export function VotingPanel({
  arguments: debateArguments,
  onVoteSubmit,
  existingVotes = [],
  currentUserId = 'user',
  readOnly = false,
}: VotingPanelProps) {
  const [votes, setVotes] = useState<VoteState[]>(
    debateArguments.map(arg => {
      // Check if user has already voted on this argument
      const existingVote = existingVotes.find(
        v => v.argumentId === arg.id && v.voterId === currentUserId
      );

      return {
        argumentId: arg.id,
        score: existingVote?.score || 0.5,
      };
    })
  );

  const [showResults, setShowResults] = useState(false);

  const handleScoreChange = (argumentId: string, newScore: number[]) => {
    setVotes(prevVotes =>
      prevVotes.map(v =>
        v.argumentId === argumentId ? { ...v, score: newScore[0] } : v
      )
    );
  };

  const handleSubmitVotes = () => {
    if (onVoteSubmit) {
      const submittedVotes: Vote[] = votes.map(v => ({
        argumentId: v.argumentId,
        score: v.score,
        voterId: currentUserId,
        timestamp: new Date(),
      }));

      onVoteSubmit(submittedVotes);
      setShowResults(true);
    }
  };

  const voteResults = calculateVoteResults(debateArguments, [
    ...existingVotes,
    ...votes.map(v => ({
      ...v,
      voterId: currentUserId,
      timestamp: new Date(),
    })),
  ]);

  const topArguments = getTopArguments(debateArguments, voteResults);

  return (
    <div className="space-y-6">
      {/* Voting Section */}
      {!showResults && !readOnly && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              صوّت على الحجج
            </CardTitle>
            <CardDescription>
              قيّم كل حجة على مقياس من 0 إلى 1 بناءً على القوة المنطقية والأدلة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {debateArguments.map((argument, idx) => {
                  const voteState = votes.find(v => v.argumentId === argument.id);
                  const score = voteState?.score || 0.5;

                  return (
                    <div key={argument.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{argument.agentName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {argument.role}
                          </Badge>
                        </div>
                        <Badge className={getScoreBadgeColor(score)}>
                          {(score * 100).toFixed(0)}%
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {argument.position}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>ضعيف</span>
                          <span>قوي</span>
                        </div>
                        <Slider
                          value={[score]}
                          min={0}
                          max={1}
                          step={0.05}
                          onValueChange={(value) => handleScoreChange(argument.id, value)}
                          className="w-full"
                        />
                        <div className="flex items-center gap-2 text-xs">
                          <ThumbsDown className={`w-4 h-4 ${score < 0.3 ? 'text-red-500' : 'text-gray-400'}`} />
                          <Progress value={score * 100} className="flex-1" />
                          <ThumbsUp className={`w-4 h-4 ${score > 0.7 ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowResults(true)}>
                عرض النتائج
              </Button>
              <Button onClick={handleSubmitVotes}>
                إرسال التصويت
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {(showResults || readOnly) && (
        <div className="space-y-4">
          {/* Top Arguments */}
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
                أفضل الحجج
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topArguments.map((argument, idx) => {
                const result = voteResults.get(argument.id);
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

                return (
                  <div
                    key={argument.id}
                    className={`p-4 rounded-lg border ${
                      idx === 0
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : idx === 1
                        ? 'border-gray-400/50 bg-gray-400/10'
                        : 'border-amber-600/50 bg-amber-600/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{medal}</span>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{argument.agentName}</h4>
                          <Badge className="bg-primary text-primary-foreground">
                            {(result?.averageScore || 0).toFixed(2)} / 1.00
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {argument.position}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{result?.voteCount || 0} أصوات</span>
                          <span>•</span>
                          <span>ثقة: {(argument.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* All Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                جميع النتائج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {[...debateArguments]
                    .sort((a, b) => {
                      const scoreA = voteResults.get(a.id)?.averageScore || 0;
                      const scoreB = voteResults.get(b.id)?.averageScore || 0;
                      return scoreB - scoreA;
                    })
                    .map((argument, idx) => {
                      const result = voteResults.get(argument.id);
                      const score = result?.averageScore || 0;

                      return (
                        <div key={argument.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground w-6">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{argument.agentName}</span>
                              <Badge variant="outline" className={getScoreBadgeColor(score)}>
                                {score.toFixed(2)}
                              </Badge>
                            </div>
                            <Progress value={score * 100} className="h-2" />
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{result?.voteCount || 0} أصوات</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {!readOnly && (
            <Button variant="outline" onClick={() => setShowResults(false)} className="w-full">
              العودة إلى التصويت
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Helper Functions (continued)
// =====================================================

function getScoreBadgeColor(score: number): string {
  if (score >= 0.8) return 'bg-green-500/20 text-green-600 border-green-500/30';
  if (score >= 0.6) return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
  if (score >= 0.4) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
  return 'bg-red-500/20 text-red-600 border-red-500/30';
}

export default VotingPanel;

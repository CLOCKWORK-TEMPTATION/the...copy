'use client';

/**
 * Violations Dashboard Component
 * Display rule violations with severity indicators and suggestions
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type RuleSeverity = 'critical' | 'major' | 'minor' | 'warning';

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  message: string;
  suggestion?: string;
  context?: string;
}

interface ViolationsDashboardProps {
  violations: RuleViolation[];
  onApplySuggestion?: (violation: RuleViolation) => void;
  onDismiss?: (violation: RuleViolation) => void;
}

export function ViolationsDashboard({
  violations,
  onApplySuggestion,
  onDismiss,
}: ViolationsDashboardProps) {
  const [dismissedViolations, setDismissedViolations] = useState<Set<string>>(new Set());

  const activeViolations = violations.filter(
    v => !dismissedViolations.has(v.ruleId)
  );

  const handleDismiss = (violation: RuleViolation) => {
    setDismissedViolations(prev => new Set([...prev, violation.ruleId]));
    onDismiss?.(violation);
  };

  const severityConfig = {
    critical: {
      color: 'destructive',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      icon: '🔴',
      label: 'حرج',
    },
    major: {
      color: 'destructive',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      icon: '🟠',
      label: 'رئيسي',
    },
    minor: {
      color: 'default',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      icon: '🟡',
      label: 'ثانوي',
    },
    warning: {
      color: 'outline',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      icon: '🔵',
      label: 'تحذير',
    },
  };

  const violationsBySeverity = activeViolations.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {} as Record<RuleSeverity, number>);

  const totalViolations = activeViolations.length;
  const criticalCount = violationsBySeverity.critical || 0;
  const majorCount = violationsBySeverity.major || 0;
  const minorCount = violationsBySeverity.minor || 0;
  const warningCount = violationsBySeverity.warning || 0;

  // Calculate compliance score
  const complianceScore = violations.length > 0
    ? Math.max(0, 100 - (criticalCount * 20 + majorCount * 10 + minorCount * 5 + warningCount * 2))
    : 100;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">لوحة الانتهاكات</h2>
        <p className="text-sm text-muted-foreground">
          انتهاكات القواعد الدستورية والتصحيحات المقترحة
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalViolations}</p>
              <p className="text-xs text-muted-foreground">إجمالي الانتهاكات</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-muted-foreground">🔴 حرجة</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{majorCount}</p>
              <p className="text-xs text-muted-foreground">🟠 رئيسية</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{minorCount}</p>
              <p className="text-xs text-muted-foreground">🟡 ثانوية</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle>درجة الامتثال</CardTitle>
          <CardDescription>
            مستوى الالتزام بالقواعد الدستورية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{complianceScore.toFixed(0)}%</span>
              <Badge variant={complianceScore >= 80 ? 'default' : complianceScore >= 60 ? 'secondary' : 'destructive'}>
                {complianceScore >= 80 ? 'ممتاز' : complianceScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
              </Badge>
            </div>
            <Progress value={complianceScore} />
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      {activeViolations.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">الانتهاكات المكتشفة</h3>
          {activeViolations.map((violation, index) => {
            const config = severityConfig[violation.severity];

            return (
              <Alert
                key={`${violation.ruleId}-${index}`}
                className={`${config.bgColor} ${config.borderColor} border-r-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2 mb-2">
                      <span>{config.icon}</span>
                      <span>{violation.ruleName}</span>
                      <Badge variant={config.color as any}>
                        {config.label}
                      </Badge>
                      {violation.context && (
                        <Badge variant="outline">
                          {violation.context}
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p className="text-sm">{violation.message}</p>
                      {violation.suggestion && (
                        <div className="mt-3 p-3 bg-white rounded-md border">
                          <p className="text-xs font-medium mb-1">💡 اقتراح:</p>
                          <p className="text-sm">{violation.suggestion}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </div>

                  <div className="flex flex-col gap-2">
                    {violation.suggestion && onApplySuggestion && (
                      <Button
                        size="sm"
                        onClick={() => onApplySuggestion(violation)}
                      >
                        تطبيق
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(violation)}
                    >
                      إخفاء
                    </Button>
                  </div>
                </div>
              </Alert>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-semibold text-green-600">
                ممتاز! لا توجد انتهاكات
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                النص يلتزم بجميع القواعد الدستورية
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dismissed Violations */}
      {dismissedViolations.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>انتهاكات مخفية</CardTitle>
            <CardDescription>
              الانتهاكات التي تم إخفاؤها ({dismissedViolations.size})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissedViolations(new Set())}
            >
              إظهار الكل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

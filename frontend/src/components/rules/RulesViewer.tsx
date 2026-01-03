'use client';

/**
 * Rules Viewer Component
 * Display and manage constitutional rules
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type RuleSeverity = 'critical' | 'major' | 'minor' | 'warning';
export type RulePriority = 'high' | 'medium' | 'low';
export type RuleCategory = 'character' | 'dialogue' | 'plot' | 'general';

export interface RuleParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  value: any;
  description: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  priority: RulePriority;
  enabled: boolean;
  parameters: RuleParameter[];
}

interface RulesViewerProps {
  rules: Rule[];
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  onParameterChange?: (ruleId: string, paramName: string, value: any) => void;
  onAddCustomRule?: (rule: Omit<Rule, 'id'>) => void;
}

export function RulesViewer({
  rules,
  onRuleToggle,
  onParameterChange,
  onAddCustomRule,
}: RulesViewerProps) {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<RuleCategory | 'all'>('all');

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const severityColors = {
    critical: 'bg-red-500',
    major: 'bg-orange-500',
    minor: 'bg-yellow-500',
    warning: 'bg-blue-500',
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  const categoryLabels: Record<RuleCategory, string> = {
    character: 'شخصيات',
    dialogue: 'حوار',
    plot: 'حبكة',
    general: 'عام',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">القواعد الدستورية</h2>
          <p className="text-sm text-muted-foreground">
            إدارة قواعد التحليل والتحقق
          </p>
        </div>
        {onAddCustomRule && (
          <Button onClick={() => {/* TODO: Open add rule dialog */}}>
            إضافة قاعدة مخصصة
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="بحث في القواعد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
              <TabsList>
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="character">شخصيات</TabsTrigger>
                <TabsTrigger value="dialogue">حوار</TabsTrigger>
                <TabsTrigger value="plot">حبكة</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => (
          <Card
            key={rule.id}
            className={`cursor-pointer transition-colors ${
              selectedRule === rule.id ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedRule(selectedRule === rule.id ? null : rule.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <Badge className={severityColors[rule.severity]}>
                      {rule.severity}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[rule.priority]}>
                      {rule.priority}
                    </Badge>
                    <Badge variant="secondary">
                      {categoryLabels[rule.category]}
                    </Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => onRuleToggle(rule.id, checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </CardHeader>

            {/* Expanded Details */}
            {selectedRule === rule.id && rule.parameters.length > 0 && (
              <CardContent>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-4">معاملات القاعدة</h4>
                  <div className="space-y-4">
                    {rule.parameters.map((param) => (
                      <div key={param.name} className="space-y-2">
                        <Label htmlFor={`${rule.id}-${param.name}`}>
                          {param.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {param.description}
                        </p>

                        {param.type === 'boolean' && (
                          <Switch
                            id={`${rule.id}-${param.name}`}
                            checked={param.value}
                            onCheckedChange={(checked) =>
                              onParameterChange?.(rule.id, param.name, checked)
                            }
                          />
                        )}

                        {param.type === 'number' && (
                          <Input
                            id={`${rule.id}-${param.name}`}
                            type="number"
                            value={param.value}
                            onChange={(e) =>
                              onParameterChange?.(rule.id, param.name, parseFloat(e.target.value))
                            }
                          />
                        )}

                        {param.type === 'string' && (
                          <Input
                            id={`${rule.id}-${param.name}`}
                            type="text"
                            value={param.value}
                            onChange={(e) =>
                              onParameterChange?.(rule.id, param.name, e.target.value)
                            }
                          />
                        )}

                        {param.type === 'array' && (
                          <div className="flex flex-wrap gap-2">
                            {param.value.map((item: any, index: number) => (
                              <Badge key={index} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              لا توجد قواعد تطابق البحث
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي القواعد</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {rules.filter(r => r.enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">نشطة</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">
                {rules.filter(r => !r.enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">معطلة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

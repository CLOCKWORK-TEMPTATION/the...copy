import { logger } from '../utils/logger';
import * as Sentry from '@sentry/node';

// ============================================
// INTERFACES AND TYPES
// ============================================

export interface GuardrailViolation {
  type: 'prompt_injection' | 'pii' | 'harmful_content' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  pattern?: string;
  matches?: string[];
}

export interface PIIDetection {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'other';
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface GuardrailResult {
  isAllowed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: GuardrailViolation[];
  warnings?: string[];
  sanitizedContent?: string;
}

export interface GuardrailMetrics {
  totalRequests: number;
  blockedRequests: number;
  violationsByType: Record<string, number>;
  violationsBySeverity: Record<string, number>;
  topPatterns: Array<{ pattern: string; count: number }>;
  recentViolations: GuardrailViolation[];
}

// ============================================
// DETECTION PATTERNS
// ============================================

// Prompt Injection Detection Patterns
const BANNED_PATTERNS = [
  /ignore.{0,100}previous.{0,100}instructions/i,
  /you are now/i,
  /forget.{0,100}above/i,
  /disregard.{0,100}instructions/i,
  /system.{0,100}prompt/i,
  /roleplay.{0,100}as/i,
  /act.{0,100}as.{0,100}if/i,
  /bypass.{0,100}security/i,
  /override.{0,100}restrictions/i,
  /debug.{0,100}mode/i,
  /admin.{0,100}access/i,
  /root.{0,100}privileges/i,
  /exploit.{0,100}vulnerability/i,
  /hack.{0,100}system/i,
  /malicious.{0,100}code/i,
];

const SUSPICIOUS_PATTERNS = [
  /system|admin|root|bypass|override|debug|exploit|hack|malicious|vulnerability|injection/gi,
];

// PII Detection Patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  credit_card: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi,
  name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  other: /\b[A-Za-z0-9]{8,}\b/g,
};

// Harmful Content Patterns
const HARMFUL_CONTENT_PATTERNS = [
  /\b(fuck|shit|damn|bitch|asshole|cunt|motherfucker)\b/i,
  /\b(hate|kill|murder|violence|attack|destroy)\b/i,
  /\b(racist|discrimination|supremacy|genocide)\b/i,
  /\b(terrorist|bomb|explosive|weapon)\b/i,
  /\b(drugs|narcotics|cocaine|heroin|meth)\b/i,
  /\b(porn|sexual|nude|explicit|adult)\b/i,
];

// Hallucination Indicators
const HALLUCINATION_INDICATORS = [
  'i believe',
  'i think',
  'i feel',
  'i guess',
  'i suppose',
  'i assume',
  'it might',
  'it could',
  'it may',
  'it seems',
  'it appears',
  'probably',
  'possibly',
  'likely',
  'perhaps',
  'in my opinion',
  'in my experience',
  'in my view',
  'i don\'t know',
  'i do not know',
  'i don\'t remember',
  'i\'m not sure',
  'i\'m uncertain',
  'i\'m unsure',
  'it depends',
  'it varies',
  'it differs',
  'could be wrong',
  'might be incorrect',
  'might be mistaken',
];

// ============================================
// MAIN SERVICE CLASS
// ============================================

export class LLMGuardrailsService {
  private metrics: GuardrailMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    violationsByType: {},
    violationsBySeverity: {},
    topPatterns: [],
    recentViolations: [],
  };

  private readonly MAX_RECENT_VIOLATIONS = 100;
  private readonly MAX_CONTENT_LENGTH = 100000; // 100KB max

  /**
   * Validates input text for prompt injection attacks and other security issues
   */
  checkInput(content: string, context?: { userId?: string; requestType?: string }): GuardrailResult {
    this.metrics.totalRequests++;
    
    const violations: GuardrailViolation[] = [];
    const warnings: string[] = [];
    
    // Check content length
    if (content.length > this.MAX_CONTENT_LENGTH) {
      violations.push({
        type: 'other',
        severity: 'high',
        description: `Content too large (${content.length} characters, max ${this.MAX_CONTENT_LENGTH})`,
      });
    }

    // Check for prompt injection patterns
    for (const pattern of BANNED_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          type: 'prompt_injection',
          severity: 'critical',
          description: `Prompt injection detected: ${pattern.source}`,
          pattern: pattern.source,
          matches,
        });
      }
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
      const matches = content.match(pattern);
      if (matches && matches.length > 5) {
        warnings.push(`Suspicious patterns detected: ${matches.length} matches for ${pattern.source}`);
      }
    }

    // Determine risk level
    const hasCriticalViolation = violations.some(v => v.severity === 'critical');
    const hasHighViolation = violations.some(v => v.severity === 'high');
    const hasMediumViolation = violations.some(v => v.severity === 'medium');

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (hasCriticalViolation) {
      riskLevel = 'critical';
    } else if (hasHighViolation) {
      riskLevel = 'high';
    } else if (hasMediumViolation || warnings.length > 0) {
      riskLevel = 'medium';
    }

    const isAllowed = riskLevel !== 'critical' && riskLevel !== 'high';

    // Record violations
    this.recordViolations(violations);
    
    if (!isAllowed) {
      this.metrics.blockedRequests++;
      logger.warn('LLM Input blocked by guardrails', {
        userId: context?.userId,
        requestType: context?.requestType,
        violations: violations.length,
        riskLevel,
      });

      Sentry.captureException(new Error('Input validation failed'), {
        extra: {
          violations,
          input: content.substring(0, 500),
          riskLevel,
          context,
        },
      });
    }

    return {
      isAllowed,
      riskLevel,
      violations,
      warnings,
    };
  }

  /**
   * Sanitizes output text to remove PII, harmful content, and hallucinations
   */
  checkOutput(content: string, context?: { userId?: string; requestType?: string }): GuardrailResult {
    const violations: GuardrailViolation[] = [];
    const warnings: string[] = [];
    let sanitizedContent = content;

    // Detect and mask PII
    const piiDetections = this.detectPII(content);
    if (piiDetections.length > 0) {
      violations.push({
        type: 'pii',
        severity: 'high',
        description: `Detected ${piiDetections.length} pieces of personal information`,
        matches: piiDetections.map(p => p.value),
      });

      // Sanitize PII
      sanitizedContent = this.sanitizePII(content, piiDetections);
    }

    // Detect harmful content
    for (const pattern of HARMFUL_CONTENT_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          type: 'harmful_content',
          severity: 'medium',
          description: `Potentially harmful content detected`,
          pattern: pattern.source,
          matches,
        });
      }
    }

    // Detect hallucination indicators
    const hallucinationMatches = content.match(new RegExp(HALLUCINATION_INDICATORS.join('|'), 'gi'));
    if (hallucinationMatches) {
      warnings.push(`Potential hallucination indicators detected: ${hallucinationMatches.length}`);
    }

    // Determine risk level
    const hasHighViolation = violations.some(v => v.severity === 'high');
    const hasMediumViolation = violations.some(v => v.severity === 'medium');

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (hasHighViolation) {
      riskLevel = 'high';
    } else if (hasMediumViolation || warnings.length > 0) {
      riskLevel = 'medium';
    }

    const isAllowed = true; // Output sanitization doesn't block, just sanitizes

    // Record violations
    this.recordViolations(violations);

    logger.info('LLM Output processed by guardrails', {
      userId: context?.userId,
      requestType: context?.requestType,
      violations: violations.length,
      warnings: warnings.length,
      riskLevel,
      piiDetected: piiDetections.length > 0,
    });

    if (violations.length > 0) {
      Sentry.captureException(new Error('Output sanitization required'), {
        extra: {
          violations,
          warnings,
          originalLength: content.length,
          sanitizedLength: sanitizedContent.length,
          riskLevel,
          context,
        },
      });
    }

    return {
      isAllowed,
      riskLevel,
      violations,
      sanitizedContent: piiDetections.length > 0 ? sanitizedContent : content,
      warnings,
    };
  }

  /**
   * Detects PII in content
   */
  private detectPII(content: string): PIIDetection[] {
    const detections: PIIDetection[] = [];

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        detections.push({
          type: type as PIIDetection['type'],
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: this.calculatePIIConfidence(type as PIIDetection['type'], match[0]),
        });
      }
    }

    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculates confidence score for PII detection
   */
  private calculatePIIConfidence(type: PIIDetection['type'], value: string): number {
    const baseConfidence = {
      email: 0.95,
      phone: 0.8,
      ssn: 0.9,
      credit_card: 0.85,
      address: 0.7,
      name: 0.6,
      other: 0.5,
    };

    let confidence = baseConfidence[type] || 0.5;

    // Increase confidence based on context
    if (type === 'email' && value.includes('.')) confidence += 0.05;
    if (type === 'phone' && value.replace(/\D/g, '').length >= 10) confidence += 0.1;
    if (type === 'credit_card' && this.isValidCreditCard(value)) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Validates credit card number using Luhn algorithm
   */
  private isValidCreditCard(value: string): boolean {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length < 13 || numbers.length > 19) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = numbers.length - 1; i >= 0; i--) {
      const char = numbers[i];
      if (char) {
        let digit = parseInt(char, 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
    }
    return sum % 10 === 0;
  }

  /**
   * Sanitizes PII from content
   */
  private sanitizePII(content: string, detections: PIIDetection[]): string {
    let sanitized = content;

    for (const detection of detections) {
      const replacement = this.getPIIReplacement(detection.type);
      sanitized = sanitized.replace(
        new RegExp(this.escapeRegex(detection.value), 'g'),
        replacement
      );
    }

    return sanitized;
  }

  /**
   * Gets appropriate replacement for PII type
   */
  private getPIIReplacement(type: PIIDetection['type']): string {
    const replacements = {
      email: '[EMAIL_REDACTED]',
      phone: '[PHONE_REDACTED]',
      ssn: '[SSN_REDACTED]',
      credit_card: '[CREDIT_CARD_REDACTED]',
      address: '[ADDRESS_REDACTED]',
      name: '[NAME_REDACTED]',
      other: '[PII_REDACTED]',
    };

    return replacements[type] || '[REDACTED]';
  }

  /**
   * Escapes regex special characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Records violations in metrics
   */
  private recordViolations(violations: GuardrailViolation[]): void {
    for (const violation of violations) {
      // Count by type
      this.metrics.violationsByType[violation.type] = 
        (this.metrics.violationsByType[violation.type] || 0) + 1;

      // Count by severity
      this.metrics.violationsBySeverity[violation.severity] = 
        (this.metrics.violationsBySeverity[violation.severity] || 0) + 1;

      // Track top patterns
      if (violation.pattern) {
        const existing = this.metrics.topPatterns.find(p => p.pattern === violation.pattern);
        if (existing) {
          existing.count++;
        } else {
          this.metrics.topPatterns.push({ pattern: violation.pattern, count: 1 });
        }
      }
    }

    // Add to recent violations
    this.metrics.recentViolations.push(...violations);
    
    // Keep only recent violations
    if (this.metrics.recentViolations.length > this.MAX_RECENT_VIOLATIONS) {
      this.metrics.recentViolations = this.metrics.recentViolations.slice(-this.MAX_RECENT_VIOLATIONS);
    }

    // Sort top patterns by count
    this.metrics.topPatterns.sort((a, b) => b.count - a.count);
    if (this.metrics.topPatterns.length > 10) {
      this.metrics.topPatterns = this.metrics.topPatterns.slice(0, 10);
    }
  }

  /**
   * Gets guardrail metrics
   */
  getMetrics(): GuardrailMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      violationsByType: {},
      violationsBySeverity: {},
      topPatterns: [],
      recentViolations: [],
    };
  }

  /**
   * Comprehensive content analysis (input and output)
   */
  comprehensiveCheck(
    input: string, 
    output: string, 
    context?: { userId?: string; requestType?: string }
  ): {
    input: GuardrailResult;
    output: GuardrailResult;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
  } {
    const inputResult = this.checkInput(input, context);
    const outputResult = this.checkOutput(output, context);

    // Determine overall risk
    const risks = [inputResult.riskLevel, outputResult.riskLevel];
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (risks.includes('critical')) {
      overallRisk = 'critical';
    } else if (risks.includes('high')) {
      overallRisk = 'high';
    } else if (risks.includes('medium')) {
      overallRisk = 'medium';
    }

    return {
      input: inputResult,
      output: outputResult,
      overallRisk,
    };
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const llmGuardrails = new LLMGuardrailsService();

// Backward compatibility - also export as default
export default llmGuardrails;

# CodeQL Security Issues - Comprehensive Analysis & Remediation Plan

**Date**: December 25, 2025  
**Status**: 18 High Severity Issues Identified  
**Priority**: CRITICAL ⚠️

---

## 📊 Issues Summary

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Regular Expression Issues | 6 | 🔴 HIGH | Partially Fixed |
| Sanitization Issues | 7 | 🔴 HIGH | Needs Fixing |
| Security Controls | 3 | 🔴 HIGH | Needs Adding |
| Other | 2 | 🔴 HIGH | Needs Fixing |
| **TOTAL** | **18** | - | - |

---

## 🔴 Critical Issues Breakdown

### 1. **Regular Expression Issues** (6 issues)

#### Issue #37: Polynomial Regular Expression (ReDoS)
- **File**: `backend/src/services/llm-guardrails.service.ts:160`
- **Problem**: Regex pattern vulnerable to Regex Denial of Service (ReDoS)
- **Example**: Patterns like `/\b(word1|word2|word3)\b/gi` can cause catastrophic backtracking
- **Impact**: CPU exhaustion, service denial
- **Severity**: 🔴 HIGH

**Solution**:
```typescript
// ❌ VULNERABLE
const HARMFUL_CONTENT_PATTERNS = [
  /\b(fuck|shit|damn|bitch|asshole|cunt|motherfucker)\b/i,
];

// ✅ FIXED: Use simple string matching
const HARMFUL_WORDS = ['fuck', 'shit', 'damn', 'bitch', 'asshole', 'cunt', 'motherfucker'];
function detectHarmfulContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return HARMFUL_WORDS.some(word => lowerText.includes(word));
}
```

#### Issue #36: Regular Expression Injection
- **File**: `backend/src/middleware/waf.middleware.ts:571`
- **Problem**: User input used directly in regex without escaping
- **Impact**: Attacker can inject regex patterns to bypass WAF
- **Severity**: 🔴 HIGH

**Solution**: Use safe-regexp utility
```typescript
// ❌ VULNERABLE
const pattern = new RegExp(userInput, 'g');

// ✅ FIXED
import { createSafeRegExp, escapeRegExp } from '@/lib/security/safe-regexp';
const pattern = createSafeRegExp(userInput);
```

#### Issues #16-18: Inefficient Regular Expressions (ReDoS)
- **Files**: 
  - `frontend/src/components/editor/screenplay-editor.tsx:273`
  - `frontend/src/utils/arabic-action-verbs.ts:358`
  - `frontend/src/components/editor/action-classifiers.ts:223`
- **Problem**: Complex regex patterns with nested quantifiers
- **Solution**: Simplify regex or use string matching

---

### 2. **Sanitization Issues** (7 issues)

#### Issues #10-14: Incomplete Multi-Character Sanitization
- **File**: `frontend/src/lib/drama-analyst/services/sanitizationService.ts:19`
- **Problem**: Replace method doesn't handle all dangerous patterns
- **Current Code**:
```typescript
.replace(/on\w+="[^"]*"/gi, "") // Only removes event handlers, not other XSS vectors
```

**Complete Solution**:
```typescript
import DOMPurify from 'dompurify';

export const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }
  
  // Use DOMPurify for comprehensive sanitization
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    FORCE_BODY: false,
  });
};
```

#### Issue #9: Incomplete String Escaping
- **File**: `frontend/scripts/check-bundle-size.js:83`
- **Problem**: Missing escape sequences in regex replacement
- **Solution**: Use proper escaping function

#### Issue #8: Bad HTML Filtering Regexp
- **File**: `frontend/src/lib/drama-analyst/services/sanitizationService.ts:20`
- **Problem**: Incomplete regex doesn't catch all dangerous patterns
- **Solution**: Use DOMPurify or whitelist approach

---

### 3. **Security Controls Missing** (3 issues)

#### Issue #15: Missing CSRF Middleware
- **File**: `backend/src/server.ts:65`
- **Problem**: No CSRF protection for state-changing requests
- **Solution**:
```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

// Apply to routes
app.post('/api/*', csrfProtection, (req, res) => {
  // Protected route
});

// Add CSRF token to forms
app.get('/form', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

#### Issue #3: Missing Rate Limiting
- **File**: `backend/src/middleware/bull-board.middleware.ts:50`
- **Problem**: Bull Board and sensitive endpoints not rate-limited
- **Solution**:
```typescript
import rateLimit from 'express-rate-limit';

const bullBoardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per IP
  message: 'Too many requests to Bull Board, please try again later',
});

app.use('/admin/bull', bullBoardLimiter);
```

---

### 4. **Other Critical Issues** (2 issues)

#### Issues #4-5: Insecure Randomness
- **Files**:
  - `frontend/src/lib/drama-analyst/services/observability.ts:265`
  - `frontend/src/lib/drama-analyst/services/observability.ts:275`
- **Problem**: Using `Math.random()` for security-sensitive operations
- **Impact**: Weak randomness in tokens/IDs
- **Solution**:
```typescript
// ❌ VULNERABLE
const id = Math.random().toString(36).substr(2);

// ✅ FIXED: Use crypto module
import { randomBytes, randomUUID } from 'crypto';

const id = randomUUID(); // For UUIDs
const token = randomBytes(32).toString('hex'); // For tokens
```

#### Issue #2: Incomplete URL Scheme Check
- **File**: `frontend/src/lib/drama-analyst/services/sanitizationService.ts:84`
- **Problem**: URL validation doesn't catch all dangerous protocols
- **Solution**:
```typescript
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const urlObj = new URL(url);
    
    // Whitelist safe protocols only
    const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];
    if (!SAFE_PROTOCOLS.includes(urlObj.protocol)) {
      return "";
    }
    
    return url;
  } catch {
    return ""; // Invalid URL
  }
};
```

---

## 🛠️ Remediation Roadmap

### Phase 1: IMMEDIATE (Today - 2 hours)
- [x] Add CSRF middleware to Express server
- [x] Install and configure DOMPurify for HTML sanitization
- [ ] Replace Math.random() with crypto.randomBytes() in observability services

### Phase 2: HIGH PRIORITY (Today - 4 hours)
- [ ] Fix all ReDoS vulnerabilities in regex patterns
- [ ] Update WAF regex patterns with safe-regexp
- [ ] Replace unsafe sanitization with DOMPurify
- [ ] Add rate limiting to bull-board middleware

### Phase 3: MEDIUM PRIORITY (Tomorrow - 6 hours)
- [ ] Audit all regex patterns in codebase
- [ ] Update URL validation across all services
- [ ] Add comprehensive security tests
- [ ] Document security best practices

### Phase 4: VERIFICATION (Tomorrow - 2 hours)
- [ ] Run CodeQL analysis again
- [ ] Verify all issues resolved
- [ ] Update security documentation
- [ ] Commit and push changes

---

## 🔗 Dependencies to Install

```bash
# For HTML sanitization
pnpm add dompurify
pnpm add -D @types/dompurify

# For CSRF protection
pnpm add csurf
pnpm add -D @types/csurf

# For rate limiting (likely already installed)
pnpm add express-rate-limit
```

---

## ✅ Verification Checklist

After fixes:
- [ ] Run CodeQL scan - expect 0 high-severity issues
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm typecheck` - no type errors
- [ ] Run security tests - all pass
- [ ] Review sanitization unit tests
- [ ] Test CSRF protection on all POST/PUT/DELETE endpoints

---

## 📚 References

- **ReDoS Prevention**: https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS
- **DOMPurify**: https://github.com/cure53/DOMPurify
- **OWASP XSS Prevention**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **URL Validation**: https://cheatsheetseries.owasp.org/cheatsheets/URL_Redirector_Cheat_Sheet.html

---

**Next Step**: Review this analysis and confirm priority for fixes.

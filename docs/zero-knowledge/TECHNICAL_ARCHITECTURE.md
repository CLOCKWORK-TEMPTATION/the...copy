# Zero-Knowledge Architecture - Technical Documentation

## Overview

This document describes the technical implementation of the Zero-Knowledge encryption architecture for The Copy platform.

---

## Core Principles (Invariants)

1. **Client-side encryption only** - All content encrypted before leaving the browser
2. **No encryption keys on server** - KEK never transmitted or stored on backend
3. **Server rejects unencrypted payloads** - Strict validation at API level
4. **No API proxy** - BYO-API: direct browser-to-provider communication
5. **No operational leakage** - No logs/analytics/crashes contain content

---

## Cryptographic Design

### Key Hierarchy

```
User Password
    │
    ├──> authVerifier (via PBKDF2)
    │       └──> authVerifierHash (stored on server)
    │
    └──> KEK (via PBKDF2)
            └──> wraps/unwraps DEK
                    └──> encrypts/decrypts document content
```

### Algorithms

| Component | Algorithm | Parameters |
|-----------|-----------|------------|
| KDF | PBKDF2 | 600,000 iterations, SHA-256 |
| Encryption | AES-GCM | 256-bit key, 96-bit IV |
| Key Wrapping | AES-GCM | Same as encryption |
| Authentication | bcrypt | 10 salt rounds on authVerifier |

### AAD (Additional Authenticated Data)

Format: `userId:docId:version`

Prevents:
- Document swapping attacks
- Replay attacks
- Cross-user decryption attempts

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- For legacy compatibility
  auth_verifier_hash TEXT,      -- bcrypt hash of authVerifier
  kdf_salt TEXT,                 -- Salt for PBKDF2
  public_key TEXT,               -- For future sharing features
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  account_status VARCHAR(50) DEFAULT 'active'
);
```

### Encrypted Documents Table

```sql
CREATE TABLE encrypted_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ciphertext TEXT NOT NULL,      -- Base64 encrypted content
  iv TEXT NOT NULL,              -- Base64 IV for content encryption
  wrapped_dek TEXT NOT NULL,     -- Base64 wrapped DEK
  wrapped_dek_iv TEXT NOT NULL,  -- Base64 IV for key wrapping
  version INTEGER NOT NULL DEFAULT 1,
  ciphertext_size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_modified TIMESTAMP DEFAULT NOW()
);
```

### Recovery Artifacts Table

```sql
CREATE TABLE recovery_artifacts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_recovery_artifact TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Authentication Flow

### Signup

```typescript
// 1. Client generates salt
const kdfSalt = generateSalt();

// 2. Derive authVerifier (for authentication)
const authVerifier = await deriveAuthVerifier(password, kdfSalt);

// 3. Derive KEK (for encryption - stays in memory)
const kek = await deriveKEK(password, kdfSalt);

// 4. Send to server (NO KEK!)
POST /api/auth/zk-signup {
  email,
  authVerifier: base64(authVerifier),
  kdfSalt: base64(kdfSalt),
  recoveryArtifact: encrypted_artifact,
  recoveryIv: base64(iv)
}

// 5. Server stores bcrypt(authVerifier), NOT the KEK
```

### Login (2-Phase)

**Phase 1: Get Salt**

```typescript
POST /api/auth/zk-login-init { email }
Response: { kdfSalt }
```

**Phase 2: Verify**

```typescript
// Client derives authVerifier using the salt
const authVerifier = await deriveAuthVerifier(password, kdfSalt);

POST /api/auth/zk-login-verify {
  email,
  authVerifier: base64(authVerifier)
}

// Server verifies bcrypt.compare(authVerifier, authVerifierHash)
```

---

## Document Encryption Flow

### Save Document

```typescript
// 1. Generate random DEK
const dek = await generateDEK();

// 2. Build AAD
const aad = buildAAD({ userId, docId, version });

// 3. Encrypt content
const { ciphertext, iv } = await encryptData(content, dek, aad);

// 4. Wrap DEK with KEK
const { wrappedDEK, wrappedDEKiv } = await wrapDEK(dek, kek);

// 5. Send to server
POST /api/docs {
  ciphertext: base64(ciphertext),
  iv: base64(iv),
  wrappedDEK: base64(wrappedDEK),
  wrappedDEKiv: base64(wrappedDEKiv),
  version
}
```

### Load Document

```typescript
// 1. Get encrypted bundle
GET /api/docs/:id
Response: { ciphertext, iv, wrappedDEK, wrappedDEKiv, version }

// 2. Unwrap DEK
const dek = await unwrapDEK(wrappedDEK, wrappedDEKiv, kek);

// 3. Decrypt content
const content = await decryptData({ ciphertext, iv }, dek, aad);
```

---

## API Endpoints

### Zero-Knowledge Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/zk-signup` | POST | Create account with ZK |
| `/api/auth/zk-login-init` | POST | Get kdfSalt |
| `/api/auth/zk-login-verify` | POST | Verify authVerifier |
| `/api/auth/recovery` | POST | Manage recovery artifact |

### Encrypted Documents

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/docs` | POST | Create encrypted document |
| `/api/docs/:id` | GET | Retrieve encrypted document |
| `/api/docs/:id` | PUT | Update encrypted document |
| `/api/docs/:id` | DELETE | Delete encrypted document |
| `/api/docs` | GET | List documents (metadata only) |

---

## BYO-API Architecture

### Principles

1. **No API keys on server** - All API keys stored locally
2. **Direct connection** - Browser → Provider (no proxy)
3. **Local encryption** - API keys encrypted with KEK derivative

### Storage

```typescript
// API keys stored in IndexedDB (encrypted)
interface EncryptedAPIConfig {
  id: string;
  providerName: string;
  endpointUrl: string;
  encryptedApiKey: string;  // encrypted with KEK
  iv: string;
  createdAt: number;
}
```

### Usage

```typescript
// 1. Retrieve config
const config = await getAPIConfig(providerId);

// 2. Make direct request
const response = await fetch(config.endpointUrl, {
  headers: {
    'Authorization': `Bearer ${config.apiKey}`
  },
  body: JSON.stringify(request)
});

// NO server proxy involved
```

---

## Security Considerations

### Threats Mitigated

✅ **Server compromise** - Encrypted data is useless without KEK  
✅ **MITM attacks** - HTTPS + AAD validation  
✅ **Replay attacks** - Version number in AAD  
✅ **Document swapping** - userId + docId in AAD  
✅ **Legal requests** - Cannot decrypt what we cannot decrypt  

### Threats NOT Mitigated

⚠️ **XSS attacks** - Can steal KEK from memory (requires CSP, sanitization)  
⚠️ **Keyloggers** - Can capture password during entry  
⚠️ **Physical access** - Can access unlocked browser  
⚠️ **Weak passwords** - User responsibility  

---

## Operational Security

### Logging Policy

**Allowed:**
- Request method, path, status code
- Response time, error type
- IP address (for rate limiting)

**FORBIDDEN:**
- Request/response bodies
- Any content snippets
- User metadata derived from content

### Analytics Policy

**Allowed:**
- Page views, button clicks
- Error counts (without context)
- Performance metrics

**FORBIDDEN:**
- Content-based events
- Search queries
- Document titles or metadata

---

## Testing

### Unit Tests

```bash
# Crypto core tests
cd frontend
pnpm test src/lib/crypto

# Backend controller tests
cd backend
pnpm test src/controllers/zkAuth.controller.test.ts
pnpm test src/controllers/encryptedDocs.controller.test.ts
```

### Integration Tests

1. **Encryption round-trip:** Encrypt then decrypt = original
2. **Reject unencrypted:** Server returns 400 for plaintext
3. **KEK isolation:** No KEK in network traffic
4. **BYO-API:** No API keys on server

---

## Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=https://app.the-copy.com

# Frontend (none for crypto - all client-side)
```

### Database Migration

```bash
cd backend
pnpm db:generate    # Generate migration from schema
pnpm db:push        # Apply to database
```

---

## Recovery Mechanism

### Recovery Key Format

```
XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
```

32 bytes of entropy, formatted in 8 groups of 4 hex digits.

### Recovery Process

1. User provides recovery key
2. Decrypt recovery artifact to get kdfSalt
3. Derive KEK using recovered salt
4. Normal decryption flow proceeds

---

## Future Enhancements

1. **Sharing:** Public key encryption for multi-user documents
2. **E2EE Collaboration:** Real-time editing with E2EE
3. **Backup encryption:** Export encrypted backup
4. **Hardware key support:** WebAuthn for KEK storage

---

## References

- [NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final) - AES-GCM
- [NIST SP 800-132](https://csrc.nist.gov/publications/detail/sp/800-132/final) - PBKDF2
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

Last updated: 2026-02-13

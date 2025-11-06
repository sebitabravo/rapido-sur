# Security Audit Report - Rápido Sur Vehicle Management System

**Date:** November 5, 2025
**Auditor:** Security Specialist
**System:** Rápido Sur - Vehicle Maintenance Management System
**Version:** 1.0.0
**Deployment Target:** Hostinger VPS with Dokploy

---

## Executive Summary

### Overall Security Score: **6/10** ⚠️

The application demonstrates good foundational security practices but has several critical vulnerabilities that MUST be addressed before production deployment. While authentication and authorization mechanisms are properly implemented, there are significant risks in token storage, JWT configuration, and input validation that could lead to security breaches.

### Risk Distribution
- 🔴 **CRITICAL:** 3 issues
- 🟠 **HIGH:** 5 issues
- 🟡 **MEDIUM:** 8 issues
- 🟢 **LOW:** 6 issues

---

## 🔴 CRITICAL VULNERABILITIES (Must Fix Before Production)

### 1. JWT Secret Fallback to Default Value
**Location:** `backend/src/modules/auth/strategies/jwt.strategy.ts:30`
```typescript
secretOrKey: configService.get<string>("JWT_SECRET") || "default-secret",
```
**Risk:** If JWT_SECRET is not set, the application falls back to "default-secret", allowing attackers to forge valid tokens.
**Fix Required:**
```typescript
const jwtSecret = configService.get<string>("JWT_SECRET");
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}
// Use jwtSecret without fallback
```

### 2. Insecure Token Storage in LocalStorage
**Location:** `frontend/lib/auth.ts:19-24`
```typescript
saveAuth(token: string, user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}
```
**Risk:** Tokens in localStorage are vulnerable to XSS attacks. Any JavaScript can read them.
**Fix Required:** Implement httpOnly secure cookies for token storage or use sessionStorage with proper CSP headers.

### 3. Insufficient Password Strength Requirements
**Location:** `backend/src/common/validators/password-strength.validator.ts:20`
```typescript
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
```
**Risk:** Missing special character requirement, allowing weak passwords.
**Fix Required:**
```typescript
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/;
// Minimum 12 chars, uppercase, lowercase, number, special character
```

---

## 🟠 HIGH-RISK VULNERABILITIES

### 1. Database Synchronization in Production
**Location:** `backend/src/app.module.ts:40`
```typescript
synchronize: configService.get("NODE_ENV") === "development",
```
**Risk:** If NODE_ENV is not properly set in production, TypeORM could drop and recreate tables.
**Fix:** Explicitly check for production environment:
```typescript
synchronize: false, // Never use synchronize in production
migrationsRun: true, // Use migrations instead
```

### 2. Sensitive Data in Logs
**Location:** `backend/src/modules/auth/auth.service.ts:37-39, 47-49`
```typescript
this.logger.warn(
  `Failed login attempt for email: ${email} - User not found or inactive`,
);
```
**Risk:** Logging email addresses could expose PII in production logs.
**Fix:** Hash or partially redact emails in logs.

### 3. Missing CSRF Protection
**Location:** Frontend API calls
**Risk:** The application lacks CSRF tokens for state-changing operations.
**Fix:** Implement CSRF tokens or use SameSite=Strict cookies with proper validation.

### 4. Weak Rate Limiting on Authentication
**Location:** `backend/src/modules/auth/auth.controller.ts:109`
```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
```
**Risk:** 5 attempts per minute is not restrictive enough for brute force protection.
**Fix:** Implement progressive delays and account lockout after failed attempts.

### 5. CSP Allows Unsafe-Inline Scripts
**Location:** `backend/src/main.ts:26`
```typescript
scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
```
**Risk:** Allows XSS through inline scripts.
**Fix:** Remove unsafe-inline and use nonces or hashes for necessary inline scripts.

---

## 🟡 MEDIUM VULNERABILITIES

### 1. No Token Refresh Mechanism
**Risk:** 24-hour JWT expiration without refresh mechanism forces re-login.
**Fix:** Implement refresh tokens with shorter access token lifetime (15 minutes).

### 2. Missing Input Sanitization
**Location:** All DTOs
**Risk:** No explicit HTML/script sanitization on string inputs.
**Fix:** Add sanitization decorators to all string inputs:
```typescript
import { Transform } from 'class-transformer';
import * as DOMPurify from 'isomorphic-dompurify';

@Transform(({ value }) => DOMPurify.sanitize(value))
descripcion: string;
```

### 3. Enum Validation Issues
**Location:** `frontend/lib/auth.ts:5`
```typescript
role: "ADMIN" | "SUPERVISOR" | "MECANICO"
```
**Risk:** Frontend role names don't match backend (Administrador, JefeMantenimiento, Mecanico).
**Fix:** Use consistent role names or create a shared enum package.

### 4. No API Versioning
**Risk:** Breaking changes could affect clients.
**Fix:** Implement API versioning (e.g., /api/v1/).

### 5. Missing Security Headers
**Risk:** No X-Frame-Options, X-Content-Type-Options headers.
**Fix:** Add comprehensive security headers in Helmet configuration.

### 6. Cleartext Transmission of Credentials
**Location:** `frontend/lib/api.ts:93`
**Risk:** Login credentials sent in request body (standard but improvable).
**Fix:** Consider implementing SRP or PAKE protocols for zero-knowledge authentication.

### 7. No Session Invalidation on Logout
**Risk:** JWT remains valid after logout until expiration.
**Fix:** Implement token blacklisting or use refresh token revocation.

### 8. Missing Field-Level Encryption
**Risk:** Sensitive data stored unencrypted in database.
**Fix:** Encrypt PII fields at rest using field-level encryption.

---

## 🟢 LOW-RISK IMPROVEMENTS

### 1. Verbose Error Messages
**Location:** `backend/src/modules/auth/auth.service.ts:94`
```typescript
throw new UnauthorizedException("Usuario no válido o inactivo");
```
**Fix:** Use generic messages like "Authentication failed".

### 2. Missing Security Event Logging
**Fix:** Implement audit logging for security events (login, failed attempts, permission changes).

### 3. No Content Security Policy Reporting
**Fix:** Add CSP report-uri to monitor violations.

### 4. Docker Running as Root (Partially Fixed)
**Note:** Backend Dockerfile correctly uses non-root user (line 58).

### 5. Missing API Documentation Security
**Fix:** Protect Swagger documentation in production or disable it.

### 6. No Dependency Vulnerability Scanning
**Fix:** Add npm audit to CI/CD pipeline.

---

## OWASP Top 10 (2021) Compliance Checklist

| OWASP Category | Status | Notes |
|----------------|--------|-------|
| A01: Broken Access Control | ⚠️ PARTIAL | RBAC implemented but missing field-level access control |
| A02: Cryptographic Failures | ✅ PASS | Bcrypt with cost 12, but JWT secret handling needs improvement |
| A03: Injection | ✅ PASS | TypeORM parameterized queries prevent SQL injection |
| A04: Insecure Design | ⚠️ PARTIAL | Missing threat modeling documentation and rate limiting improvements needed |
| A05: Security Misconfiguration | ❌ FAIL | CSP allows unsafe-inline, default JWT secret fallback |
| A06: Vulnerable Components | ⚠️ UNKNOWN | No dependency scanning configured |
| A07: Identification and Auth Failures | ⚠️ PARTIAL | Good auth but weak rate limiting and no account lockout |
| A08: Software and Data Integrity | ✅ PASS | Good CI/CD practices with Docker |
| A09: Security Logging Failures | ❌ FAIL | Sensitive data in logs, no security event monitoring |
| A10: SSRF | ✅ PASS | No external URL fetching identified |

---

## Actionable Fixes with Code Examples

### Priority 1: Fix JWT Secret Configuration
```typescript
// backend/src/config/configuration.ts (create new file)
export default () => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters');
  }
  return {
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    }
  };
};
```

### Priority 2: Implement Secure Token Storage
```typescript
// backend/src/modules/auth/auth.controller.ts
@Post('login')
async login(@Request() req: RequestWithUser, @Res() res: Response) {
  const { access_token, user } = this.authService.login(req.user);

  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  return res.json({ user }); // Don't send token in body
}
```

### Priority 3: Implement Progressive Rate Limiting
```typescript
// backend/src/modules/auth/guards/login-throttle.guard.ts
import { ThrottlerGuard } from '@nestjs/throttler';

export class LoginThrottleGuard extends ThrottlerGuard {
  private attempts = new Map<string, number>();

  async handleRequest(context, limit, ttl): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip + ':' + request.body.email;

    const attemptCount = this.attempts.get(key) || 0;
    if (attemptCount >= 3) {
      // Exponential backoff
      const delay = Math.min(Math.pow(2, attemptCount - 3) * 1000, 300000);
      throw new TooManyRequestsException(`Too many attempts. Wait ${delay/1000} seconds`);
    }

    return super.handleRequest(context, limit, ttl);
  }
}
```

### Priority 4: Add Input Sanitization Middleware
```typescript
// backend/src/common/middleware/sanitize.middleware.ts
import * as DOMPurify from 'isomorphic-dompurify';

export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    next();
  }

  private sanitizeObject(obj: any): any {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = DOMPurify.sanitize(obj[key]);
      } else if (typeof obj[key] === 'object') {
        obj[key] = this.sanitizeObject(obj[key]);
      }
    }
    return obj;
  }
}
```

---

## DevSecOps Recommendations for CI/CD Pipeline

### 1. Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    hooks:
      - id: detect-secrets
  - repo: https://github.com/trufflesecurity/trufflehog
    hooks:
      - id: trufflehog
```

### 2. GitHub Actions Security Workflow
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: |
          cd backend && npm audit --audit-level=high
          cd ../frontend && npm audit --audit-level=high

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          path: '.'
          format: 'HTML'
```

### 3. Docker Image Scanning
```bash
# Add to deployment script
docker scan rapido-sur-backend:latest --severity high
trivy image rapido-sur-backend:latest
```

### 4. Runtime Security Monitoring
```typescript
// backend/src/common/interceptors/security-logging.interceptor.ts
@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Log security events
    if (request.url.includes('/auth/login')) {
      this.logSecurityEvent('LOGIN_ATTEMPT', {
        ip: request.ip,
        userAgent: request.headers['user-agent']
      });
    }

    return next.handle().pipe(
      tap(() => {
        if (request.url.includes('/auth/login')) {
          this.logSecurityEvent('LOGIN_SUCCESS', {
            userId: user?.id,
            ip: request.ip
          });
        }
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.logSecurityEvent('AUTH_FAILURE', {
            ip: request.ip,
            path: request.url
          });
        }
        throw error;
      })
    );
  }
}
```

---

## Production Deployment Security Checklist

### Before Deployment
- [ ] Generate cryptographically secure JWT_SECRET (minimum 64 characters)
- [ ] Set all environment variables in Dokploy UI (never in code)
- [ ] Verify NODE_ENV=production
- [ ] Configure HTTPS with Let's Encrypt in Dokploy
- [ ] Set strong database password (16+ chars with special characters)
- [ ] Configure email service with app-specific password
- [ ] Review and update CORS origin to production domain
- [ ] Disable Swagger documentation or protect with authentication
- [ ] Run security scan on Docker images
- [ ] Implement database backup strategy
- [ ] Configure log rotation and monitoring
- [ ] Set up alerting for security events

### After Deployment
- [ ] Verify HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Test rate limiting on authentication endpoints
- [ ] Verify security headers with securityheaders.com
- [ ] Run penetration test with OWASP ZAP
- [ ] Monitor for unusual authentication patterns
- [ ] Set up regular dependency updates schedule
- [ ] Configure automated security scanning in CI/CD

---

## Immediate Action Items

1. **TODAY - Critical**
   - Fix JWT secret fallback issue
   - Remove unsafe-inline from CSP
   - Set synchronize: false for production

2. **This Week - High Priority**
   - Implement secure cookie-based authentication
   - Strengthen password requirements
   - Add account lockout mechanism
   - Remove sensitive data from logs

3. **Before Production - Medium Priority**
   - Implement refresh tokens
   - Add input sanitization
   - Configure comprehensive security headers
   - Set up dependency scanning

---

## Conclusion

The Rápido Sur system shows a solid foundation with proper authentication, authorization, and basic security measures in place. However, critical issues with JWT configuration, token storage, and rate limiting must be addressed immediately. The development team has demonstrated security awareness by using bcrypt with proper cost factor, implementing RBAC, and using parameterized queries.

**Recommended Timeline:**
- Fix critical issues: 1-2 days
- Implement high-priority fixes: 3-5 days
- Complete all security enhancements: 2 weeks

**Final Recommendation:** DO NOT deploy to production until all CRITICAL and HIGH-risk vulnerabilities are resolved. Schedule a follow-up security audit after implementing these fixes.

---

*Generated by Security Audit Tool v1.0*
*For questions, contact: security@rapidosur.cl*
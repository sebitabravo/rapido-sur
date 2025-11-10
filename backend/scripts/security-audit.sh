#!/bin/bash

# Security Audit Script for Rápido Sur Backend
# TEST-004: OWASP Security Validation

echo "🔒 Running Security Audit for Rápido Sur"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
ISSUES=0

# 1. NPM Audit
echo "📦 Step 1: NPM Dependency Audit"
echo "--------------------------------"

npm audit --production --audit-level=high 2>&1 | tee audit-report.txt

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  High/Critical vulnerabilities found${NC}"
    ISSUES=$((ISSUES + 1))
    
    echo ""
    echo "Known Issues:"
    echo "- html-minifier (mjml dependency): REDoS vulnerability"
    echo "  Status: LOW RISK - Only used in email templates, not user-facing"
    echo "  Action: Monitor for updates to @nestjs-modules/mailer"
    echo ""
else
    echo -e "${GREEN}✅ No high/critical vulnerabilities${NC}"
fi

echo ""

# 2. Check for hardcoded secrets
echo "🔑 Step 2: Scanning for hardcoded secrets"
echo "------------------------------------------"

SECRET_PATTERNS=(
    "password\s*=\s*['\"]"
    "api[_-]?key\s*=\s*['\"]"
    "secret\s*=\s*['\"]"
    "token\s*=\s*['\"]"
    "private[_-]?key"
)

FOUND_SECRETS=false

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -E "$pattern" src/ --exclude-dir=node_modules 2>/dev/null; then
        FOUND_SECRETS=true
        ISSUES=$((ISSUES + 1))
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
else
    echo -e "${RED}❌ Potential hardcoded secrets detected${NC}"
fi

echo ""

# 3. Check .env is in .gitignore
echo "📝 Step 3: Checking .gitignore configuration"
echo "--------------------------------------------"

if grep -q "^\.env$" ../.gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ .env is NOT in .gitignore${NC}"
    ISSUES=$((ISSUES + 1))
fi

if grep -q "^node_modules$" ../.gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ node_modules is in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules should be in .gitignore${NC}"
fi

echo ""

# 4. Check for .env.example
echo "📋 Step 4: Checking environment variable documentation"
echo "------------------------------------------------------"

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.example not found${NC}"
fi

echo ""

# 5. TypeScript strict mode
echo "🔧 Step 5: Checking TypeScript configuration"
echo "---------------------------------------------"

if grep -q '"strict": true' tsconfig.json; then
    echo -e "${GREEN}✅ TypeScript strict mode enabled${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript strict mode not enabled${NC}"
fi

echo ""

# 6. Check helmet configuration
echo "🛡️  Step 6: Checking security headers (Helmet)"
echo "-----------------------------------------------"

if grep -q "helmet" src/main.ts; then
    echo -e "${GREEN}✅ Helmet is configured${NC}"
else
    echo -e "${RED}❌ Helmet is NOT configured${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# 7. Check CORS configuration
echo "🌐 Step 7: Checking CORS configuration"
echo "---------------------------------------"

if grep -q "enableCors" src/main.ts; then
    echo -e "${GREEN}✅ CORS is configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS configuration not found${NC}"
fi

echo ""

# 8. Check validation pipes
echo "✔️  Step 8: Checking input validation"
echo "---------------------------------------"

if grep -q "ValidationPipe" src/main.ts; then
    echo -e "${GREEN}✅ Global ValidationPipe is configured${NC}"
else
    echo -e "${RED}❌ Global ValidationPipe NOT configured${NC}"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# 9. Check bcrypt usage
echo "🔐 Step 9: Checking password hashing"
echo "-------------------------------------"

if grep -r "bcrypt\.hash.*12" src/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ bcrypt with cost factor 12 is used${NC}"
else
    echo -e "${YELLOW}⚠️  bcrypt cost factor 12 not confirmed${NC}"
fi

echo ""

# 10. Check for console.log in production code
echo "🧹 Step 10: Checking for debug code"
echo "------------------------------------"

CONSOLE_COUNT=$(grep -r "console\.log" src/ --exclude-dir=node_modules 2>/dev/null | wc -l)

if [ $CONSOLE_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No console.log found${NC}"
else
    echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements${NC}"
    echo "   (Should use Logger instead)"
fi

echo ""

# Summary
echo "========================================"
echo "📊 SECURITY AUDIT SUMMARY"
echo "========================================"
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All critical security checks passed!${NC}"
    echo ""
    echo "Security Score: A+"
    exit 0
else
    echo -e "${YELLOW}⚠️  Found $ISSUES potential security issues${NC}"
    echo ""
    echo "Security Score: B"
    echo ""
    echo "Please review the issues above and address them."
    exit 1
fi

#!/bin/bash

# E2E Test Setup Verification Script
# This script verifies that the E2E test environment is properly configured

set -e

echo "🔍 Verifying E2E Test Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
ERRORS=0
WARNINGS=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS+1))
fi

# Check pnpm
echo -n "Checking pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} $PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found"
    ERRORS=$((ERRORS+1))
fi

# Check Python
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3 not found"
    ERRORS=$((ERRORS+1))
fi

# Check MongoDB
echo -n "Checking MongoDB... "
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand({ ping: 1 })" --quiet &> /dev/null; then
        echo -e "${GREEN}✓${NC} MongoDB is running"
    else
        echo -e "${YELLOW}⚠${NC} MongoDB installed but not running"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${YELLOW}⚠${NC} MongoDB not found (required for tests)"
    WARNINGS=$((WARNINGS+1))
fi

# Check .env.local
echo -n "Checking .env.local... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Found"
    
    # Check required variables
    if grep -q "MONGO_URI" .env.local; then
        echo "  ├─ MONGO_URI: ${GREEN}✓${NC}"
    else
        echo "  ├─ MONGO_URI: ${RED}✗${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "ADMIN_PASSWORD" .env.local; then
        echo "  ├─ ADMIN_PASSWORD: ${GREEN}✓${NC}"
    else
        echo "  ├─ ADMIN_PASSWORD: ${RED}✗${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
    
    if grep -q "API_URL" .env.local; then
        echo "  └─ API_URL: ${GREEN}✓${NC}"
    else
        echo "  └─ API_URL: ${RED}✗${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Not found (copy from .env.local.example)"
    WARNINGS=$((WARNINGS+1))
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} Run 'pnpm install'"
    ERRORS=$((ERRORS+1))
fi

# Check Playwright
echo -n "Checking Playwright... "
if [ -d "node_modules/.pnpm/@playwright+test@"* ]; then
    echo -e "${GREEN}✓${NC} Playwright installed"
else
    echo -e "${RED}✗${NC} Playwright not installed"
    ERRORS=$((ERRORS+1))
fi

# Check test files
echo -n "Checking test files... "
TEST_FILES=$(find e2e -name "*.spec.ts" | wc -l)
if [ "$TEST_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $TEST_FILES test suites"
else
    echo -e "${RED}✗${NC} No test files found"
    ERRORS=$((ERRORS+1))
fi

# Check backend
echo -n "Checking backend... "
if [ -d "backend" ] && [ -f "backend/pyproject.toml" ]; then
    echo -e "${GREEN}✓${NC} Backend found"
else
    echo -e "${RED}✗${NC} Backend not found"
    ERRORS=$((ERRORS+1))
fi

# Check ports
echo -n "Checking port 8000... "
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 8000 is in use"
    WARNINGS=$((WARNINGS+1))
else
    echo -e "${GREEN}✓${NC} Available"
fi

echo -n "Checking port 8080... "
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port 8080 is in use"
    WARNINGS=$((WARNINGS+1))
else
    echo -e "${GREEN}✓${NC} Available"
fi

echo ""
echo "📊 Summary:"
echo "─────────────────────────────────"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can now run tests:"
    echo "  pnpm test:e2e        - Run all E2E tests"
    echo "  pnpm test:e2e:ui     - Run with UI (recommended)"
    echo "  pnpm test:e2e:headed - Run with visible browser"
    echo ""
    exit 0
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the issues above before running tests."
    echo ""
    exit 1
fi

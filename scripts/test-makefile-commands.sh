#!/bin/bash

# Test all Makefile commands to ensure they work correctly
# This script validates that all make targets execute without errors

set -e

# Colors for output
BLUE='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

echo -e "${BLUE}======================================================================${RESET}"
echo -e "${BLUE}🧪 Testing Makefile Commands${RESET}"
echo -e "${BLUE}======================================================================${RESET}"

# Track results
PASSED=0
FAILED=0
SKIPPED=0

# Test function
test_command() {
    local cmd=$1
    local description=$2
    local skip=${3:-false}
    
    echo -e "\n${YELLOW}Testing: ${cmd}${RESET}"
    echo -e "   ${description}"
    
    if [ "$skip" = true ]; then
        echo -e "   ${YELLOW}⏭️  Skipped (requires manual intervention)${RESET}"
        SKIPPED=$((SKIPPED + 1))
        return
    fi
    
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Passed${RESET}"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${RED}❌ Failed${RESET}"
        FAILED=$((FAILED + 1))
    fi
}

# Test read-only commands (safe to run)
echo -e "\n${BLUE}📋 Testing Read-Only Commands${RESET}"

test_command "make status" "Show service status"
test_command "make ps" "Alias for status"
test_command "make health" "Check service health"

# Test Cardano commands
echo -e "\n${BLUE}🪙 Testing Cardano Commands${RESET}"

test_command "make cardano-validate" "Validate Cardano integration readiness"
test_command "make cardano-test" "Run Cardano integration tests"

# Test commands that require user input or are destructive (skip)
echo -e "\n${BLUE}⚠️  Skipping Destructive/Interactive Commands${RESET}"

test_command "make install" "Install dependencies" true
test_command "make build" "Build Docker images" true
test_command "make dev" "Start development environment" true
test_command "make prod" "Start production environment" true
test_command "make stop" "Stop all services" true
test_command "make restart" "Restart development environment" true
test_command "make clean" "Clean up Docker resources" true
test_command "make rebuild" "Clean rebuild of all images" true
test_command "make cardano-setup" "Setup Cardano development environment" true
test_command "make cardano-docker-test" "Test Cardano in Docker environment" true
test_command "make db-shell" "Open PostgreSQL shell" true
test_command "make db-backup" "Backup database" true
test_command "make shell-backend" "Execute shell in backend container" true
test_command "make shell-frontend" "Execute shell in frontend container" true

# Summary
echo -e "\n${BLUE}======================================================================${RESET}"
echo -e "${BLUE}📊 Test Results${RESET}"
echo -e "${BLUE}======================================================================${RESET}"
echo -e "${GREEN}✅ Passed:  ${PASSED}${RESET}"
echo -e "${RED}❌ Failed:  ${FAILED}${RESET}"
echo -e "${YELLOW}⏭️  Skipped: ${SKIPPED}${RESET}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tested commands passed!${RESET}"
    exit 0
else
    echo -e "${RED}❌ Some commands failed${RESET}"
    exit 1
fi

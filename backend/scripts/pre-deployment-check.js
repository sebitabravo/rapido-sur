#!/usr/bin/env node

/**
 * Pre-Deployment Validation Script
 *
 * This script validates that the backend is ready for production deployment.
 * It checks for common issues and configuration problems.
 *
 * Usage:
 *   node scripts/pre-deployment-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Pre-Deployment Validation for Rápido Sur Backend\n');
console.log('=' .repeat(70));
console.log('\n');

let errors = 0;
let warnings = 0;

// ================================
// 1. Check Critical Files
// ================================
console.log('📁 Checking critical files...\n');

const criticalFiles = [
  'Dockerfile',
  'docker-compose.prod.yml',
  '.dockerignore',
  'package.json',
  'tsconfig.json',
  '.env.example',
  'src/main.ts',
  'src/app.module.ts',
  'src/database/data-source.ts',
  'src/database/seeds/seed.ts',
];

criticalFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING!`);
    errors++;
  }
});

console.log('\n');

// ================================
// 2. Check package.json Scripts
// ================================
console.log('📦 Checking package.json scripts...\n');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const requiredScripts = [
  'build',
  'start:prod',
  'migration:run',
  'migration:generate',
  'seed',
];

requiredScripts.forEach((script) => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} - MISSING!`);
    errors++;
  }
});

console.log('\n');

// ================================
// 3. Check .env.example
// ================================
console.log('🔐 Checking .env.example...\n');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envExample = fs.readFileSync(envExamplePath, 'utf-8');

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'FRONTEND_URL',
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASSWORD',
  'MAINTENANCE_MANAGER_EMAIL',
  'ENABLE_CRON',
];

requiredEnvVars.forEach((envVar) => {
  if (envExample.includes(envVar)) {
    console.log(`  ✅ ${envVar}`);
  } else {
    console.log(`  ⚠️  ${envVar} - MISSING in .env.example`);
    warnings++;
  }
});

console.log('\n');

// ================================
// 4. Check Dockerfile
// ================================
console.log('🐳 Checking Dockerfile...\n');

const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
const dockerfile = fs.readFileSync(dockerfilePath, 'utf-8');

const dockerfileChecks = [
  { pattern: /FROM node:20-alpine AS builder/, message: 'Multi-stage build' },
  { pattern: /FROM node:20-alpine AS production/, message: 'Production stage' },
  { pattern: /npm ci/, message: 'Uses npm ci (not npm install)' },
  { pattern: /npm run build/, message: 'Builds TypeScript' },
  { pattern: /EXPOSE 3000/, message: 'Exposes port 3000' },
  { pattern: /HEALTHCHECK/, message: 'Has healthcheck' },
  { pattern: /USER nestjs/, message: 'Runs as non-root user' },
];

dockerfileChecks.forEach((check) => {
  if (check.pattern.test(dockerfile)) {
    console.log(`  ✅ ${check.message}`);
  } else {
    console.log(`  ❌ ${check.message} - MISSING!`);
    errors++;
  }
});

console.log('\n');

// ================================
// 5. Check docker-compose.prod.yml
// ================================
console.log('🐋 Checking docker-compose.prod.yml...\n');

const composeFilePath = path.join(__dirname, '..', 'docker-compose.prod.yml');
const composeFile = fs.readFileSync(composeFilePath, 'utf-8');

const composeChecks = [
  { pattern: /NODE_ENV.*production/, message: 'NODE_ENV set to production' },
  { pattern: /healthcheck:/, message: 'Has healthcheck configured' },
  { pattern: /restart: always/, message: 'Restart policy configured' },
  { pattern: /logging:/, message: 'Logging configured' },
];

composeChecks.forEach((check) => {
  if (check.pattern.test(composeFile)) {
    console.log(`  ✅ ${check.message}`);
  } else {
    console.log(`  ⚠️  ${check.message} - RECOMMENDED`);
    warnings++;
  }
});

console.log('\n');

// ================================
// 6. Check TypeScript Config
// ================================
console.log('📘 Checking TypeScript configuration...\n');

const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

if (tsconfig.compilerOptions.strict) {
  console.log('  ✅ Strict mode enabled');
} else {
  console.log('  ⚠️  Strict mode disabled - RECOMMENDED for production');
  warnings++;
}

if (tsconfig.compilerOptions.esModuleInterop) {
  console.log('  ✅ esModuleInterop enabled');
} else {
  console.log('  ❌ esModuleInterop disabled');
  errors++;
}

console.log('\n');

// ================================
// 7. Check for Common Security Issues
// ================================
console.log('🔒 Checking for security issues...\n');

// Check if .env is in .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

if (gitignore.includes('.env') && !gitignore.includes('!.env.example')) {
  console.log('  ✅ .env in .gitignore (not committed)');
} else {
  console.log('  ❌ .env NOT properly ignored - SECURITY RISK!');
  errors++;
}

// Check if node_modules is in .dockerignore
const dockerignorePath = path.join(__dirname, '..', '.dockerignore');
const dockerignore = fs.readFileSync(dockerignorePath, 'utf-8');

if (dockerignore.includes('node_modules')) {
  console.log('  ✅ node_modules in .dockerignore');
} else {
  console.log('  ⚠️  node_modules NOT in .dockerignore - larger image size');
  warnings++;
}

console.log('\n');

// ================================
// Summary
// ================================
console.log('=' .repeat(70));
console.log('\n📊 Validation Summary:\n');

if (errors === 0 && warnings === 0) {
  console.log('  🎉 All checks passed! Backend is ready for deployment.\n');
} else {
  if (errors > 0) {
    console.log(`  ❌ ${errors} error(s) found - MUST FIX before deployment`);
  }
  if (warnings > 0) {
    console.log(`  ⚠️  ${warnings} warning(s) found - RECOMMENDED to fix`);
  }
  console.log('\n');
}

console.log('=' .repeat(70));
console.log('\n');

// Exit with error code if there are errors
process.exit(errors > 0 ? 1 : 0);

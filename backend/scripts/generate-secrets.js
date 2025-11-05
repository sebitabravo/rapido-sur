#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production
 *
 * This script generates cryptographically secure random strings
 * for use in production environment variables.
 *
 * Usage:
 *   node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('=' .repeat(70));
console.log('\n');

// Generate JWT Secret (64 bytes = 128 hex characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('📝 JWT_SECRET (copy this to Dokploy):');
console.log('─'.repeat(70));
console.log(jwtSecret);
console.log('─'.repeat(70));
console.log('\n');

// Generate Database Password (24 bytes base64 = 32 characters)
const dbPassword = crypto.randomBytes(24).toString('base64');
console.log('🗄️  DB_PASSWORD (strong database password):');
console.log('─'.repeat(70));
console.log(dbPassword);
console.log('─'.repeat(70));
console.log('\n');

// Generate Session Secret (32 bytes)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('🔑 SESSION_SECRET (if needed in the future):');
console.log('─'.repeat(70));
console.log(sessionSecret);
console.log('─'.repeat(70));
console.log('\n');

// Generate API Key (16 bytes)
const apiKey = crypto.randomBytes(16).toString('hex');
console.log('🔗 API_KEY (if needed for external integrations):');
console.log('─'.repeat(70));
console.log(apiKey);
console.log('─'.repeat(70));
console.log('\n');

console.log('=' .repeat(70));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:\n');
console.log('  1. NEVER commit these secrets to Git');
console.log('  2. Store them securely in Dokploy Environment Variables');
console.log('  3. Use different secrets for development and production');
console.log('  4. Rotate secrets periodically (every 90 days recommended)');
console.log('  5. Keep a secure backup of production secrets\n');
console.log('=' .repeat(70));
console.log('\n');

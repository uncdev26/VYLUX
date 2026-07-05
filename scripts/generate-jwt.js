#!/usr/bin/env node
// Generate Supabase-compatible JWT keys for self-hosted PostgREST
// Usage: node scripts/generate-jwt.js [secret]
// If no secret provided, generates a random 32-char secret

const crypto = require('crypto');

const secret = process.argv[2] || crypto.randomBytes(24).toString('base64').slice(0, 32);

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', secret)
    .update(header + '.' + body)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return header + '.' + body + '.' + sig;
}

const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 365 * 24 * 60 * 60; // 10 years

const anonKey = signJWT({ role: 'anon', iss: 'supabase', iat: now, exp }, secret);
const serviceKey = signJWT({ role: 'service_role', iss: 'supabase', iat: now, exp }, secret);

console.log('');
console.log('=== Supabase Self-Hosted JWT Keys ===');
console.log('');
console.log('PGRST_JWT_SECRET=' + secret);
console.log('');
console.log('ANON_KEY=' + anonKey);
console.log('');
console.log('SERVICE_ROLE_KEY=' + serviceKey);
console.log('');
console.log('=== For Railway ===');
console.log('');
console.log('PostgREST service env:');
console.log('  PGRST_JWT_SECRET=' + secret);
console.log('');
console.log('App service env:');
console.log('  SUPABASE_ANON_KEY=' + anonKey);
console.log('');

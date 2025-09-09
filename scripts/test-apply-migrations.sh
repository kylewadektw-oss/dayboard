#!/usr/bin/env bash
set -euo pipefail

# Spins up ephemeral local Supabase db, applies migrations, then tears down.
# Requires supabase CLI configured for local usage.

echo "[migrations:apply:test] Starting ephemeral test..."

npx supabase stop >/dev/null 2>&1 || true
npx supabase start

echo "[migrations:apply:test] Applying migrations..."
npx supabase db reset --no-seed --force

echo "[migrations:apply:test] Success. Stopping instance..."
npx supabase stop

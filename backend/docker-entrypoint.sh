#!/bin/sh
set -e

echo "🔄 Running database migrations..."
pnpm run db:push

echo "✅ Migrations complete!"
echo "🚀 Starting server..."
exec "$@"

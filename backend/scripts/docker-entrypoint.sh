#!/bin/sh
set -e

echo "🚀 Starting Rápido Sur Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'rapido_sur'
});
client.connect()
  .then(() => {
    console.log('✅ PostgreSQL is ready');
    client.end();
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
" 2>/dev/null; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Note: Migrations run automatically via TypeORM (migrationsRun: true in production)
# Note: Seeding runs automatically via SeedingService (if ENABLE_SEEDING=true)

echo "🎉 Initialization complete!"
echo "🚀 Starting NestJS application..."
echo "   📝 Migrations will run automatically (if in production mode)"
echo "   🌱 Seeding will run if ENABLE_SEEDING=true"

# Execute the main application
exec "$@"

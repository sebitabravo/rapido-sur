#!/bin/bash

# Database backup script

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/rapido_sur_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup..."

# Backup database
docker exec rapido-sur-db pg_dump -U rapido_sur_user rapido_sur > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✓ Backup completed: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.gz | tail -n +8 | xargs -r rm

echo "✓ Old backups cleaned up"

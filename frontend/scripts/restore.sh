#!/bin/bash

# Database restore script

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  This will restore the database from: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "🔄 Starting database restore..."

# Decompress and restore
gunzip -c $BACKUP_FILE | docker exec -i rapido-sur-db psql -U rapido_sur_user rapido_sur

echo "✓ Database restored successfully"

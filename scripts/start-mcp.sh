#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Start the Google Flow Browser MCP server
# Requires Chrome to already be running with CDP (start-browser.sh)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

log()  { echo "[$(date '+%Y-%m-%dT%H:%M:%S')] INFO  $*" >&2; }
warn() { echo "[$(date '+%Y-%m-%dT%H:%M:%S')] WARN  $*" >&2; }
die()  { echo "[$(date '+%Y-%m-%dT%H:%M:%S')] ERROR $*" >&2; exit 1; }

# Check Node
command -v node >/dev/null 2>&1 || die "Node.js is required"

# Check CDP port, launch browser automatically if not running
if ! curl -s http://localhost:9222/json/version >/dev/null 2>&1; then
  log "CDP port 9222 not responding — automatically launching Chrome..."
  "$SCRIPT_DIR/start-browser.sh"
fi

log "Starting Google Flow Browser MCP server..."
cd "$PROJECT_DIR"
exec node src/index.js

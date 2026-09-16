#!/usr/bin/env bash
set -e

echo "=== Installing Cockpit Sensors (Material Dark Redesign) ==="
TARGET_DIR="${HOME}/.local/share/cockpit/sensors"
BIN_DIR="${HOME}/.local/bin"

mkdir -p "${TARGET_DIR}" "${BIN_DIR}"

cp -v app.css app.js index.html manifest.json "${TARGET_DIR}/"
cp -v sensors "${BIN_DIR}/sensors"
chmod +x "${BIN_DIR}/sensors"

echo "=== Installation complete! Access Cockpit at https://<server-ip>:9090 ==="

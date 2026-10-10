#!/usr/bin/env bash
set -e

# ============================================
# deploy-script.sh
# Uso: bash deploy-script.sh [branch]
# Ex.:  bash deploy-script.sh main
# ============================================

BRANCH="${1:-main}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$PROJECT_DIR/deploy.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando deploy — branch $BRANCH" | tee "$LOG_FILE"

# 1. Atualizar código
echo ">>> git pull origin $BRANCH"
git -C "$PROJECT_DIR" fetch origin "$BRANCH"
git -C "$PROJECT_DIR" reset --hard "origin/$BRANCH"

# 2. Instalar dependências
echo ">>> npm install"
npm install --prefix "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

# 3. Build
echo ">>> npm run build"
npm run build --prefix "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

# 4. Reiniciar servidor Node
echo ">>> Reiniciando servidor..."
if command -v pm2 &> /dev/null; then
  pm2 restart foco-em-dados --update-env 2>&1 | tee -a "$LOG_FILE" || \
  pm2 start "$PROJECT_DIR/dist/server.cjs" --name foco-em-dados --update-env 2>&1 | tee -a "$LOG_FILE"
  echo "Servidor reiniciado via PM2."
else
  # Mata processo na porta 3000 e sobe novo
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  nohup node "$PROJECT_DIR/dist/server.cjs" > "$PROJECT_DIR/server.log" 2>&1 &
  echo "Servidor reiniciado em background (PID: $!)."
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploy concluído com sucesso!" | tee -a "$LOG_FILE"

#!/bin/sh

# Запуск backend API в фоне
echo "🚀 Starting backend API server..."
cd /app/server && node index.js &

# Ждем немного пока backend запустится
sleep 2

# Запуск nginx на переднем плане
echo "🚀 Starting nginx..."
nginx -g 'daemon off;'

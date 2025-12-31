# Multi-service Docker build (Frontend + Backend API)

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Build arguments для API ключа
ARG VITE_OPENAI_API_KEY

# Устанавливаем переменную окружения
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# Копируем package файлы фронтенда
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Создаем production build
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Копируем package файлы backend
COPY server/package*.json ./

# Устанавливаем зависимости
RUN npm ci --production

# Копируем server код
COPY server/ ./

# Stage 3: Production (Nginx + Node.js)
FROM node:18-alpine

# Устанавливаем nginx
RUN apk add --no-cache nginx

# Копируем backend из stage 2
WORKDIR /app/server
COPY --from=backend-builder /app ./

# Копируем frontend build в nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию
COPY nginx-proxy.conf /etc/nginx/http.d/default.conf

# Создаем скрипт запуска обоих сервисов
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Открываем порт 80
EXPOSE 80

# Запускаем оба сервиса
CMD ["/start.sh"]

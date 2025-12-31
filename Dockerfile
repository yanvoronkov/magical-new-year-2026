# Multi-stage build для минимизации размера образа

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Объявляем build argument для API ключа
ARG VITE_OPENAI_API_KEY
ARG VITE_GEMINI_API_KEY

# Устанавливаем переменные окружения для Vite
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Создаем production build
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Копируем build из предыдущего stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

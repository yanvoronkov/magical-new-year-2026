# Simple frontend-only build

FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments
ARG VITE_OPENAI_API_KEY
ARG VITE_API_URL

# Environment variables
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

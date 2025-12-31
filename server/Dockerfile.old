FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy server code
COPY index.js ./

# Set environment variables
ENV PORT=3001

EXPOSE 3001

CMD ["node", "index.js"]

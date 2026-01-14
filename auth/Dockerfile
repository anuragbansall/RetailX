# Use a lightweight Node.js runtime
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (only production)
COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy app source
COPY server.js ./
COPY src ./src

# Set environment
ENV NODE_ENV=production

# Expose service port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]

# Use Node.js LTS (Long Term Support) image
FROM node:20-slim

# Create and set working directory
WORKDIR /app

# Copy package files from the server directory first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the server source code
COPY server/ .

# Create relevant directories
RUN mkdir -p uploads ../database ../data

# HuggingFace uses port 7860 by default
EXPOSE 7860

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7860

# Start the application
CMD ["node", "index.js"]

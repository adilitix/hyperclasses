# Use Node.js LTS (Long Term Support) image
FROM node:20-slim

# Create and set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
# Using --production to skip devDependencies for a smaller image
RUN npm install --production

# Copy the rest of the server source code
COPY . .

# Create the uploads and database directories to avoid permission issues
RUN mkdir -p uploads ../database ../data

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "index.js"]

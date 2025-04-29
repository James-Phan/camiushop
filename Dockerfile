FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Create a production build
RUN npm run build

# Copy environment file for Docker
COPY .env.docker .env

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app will run on
EXPOSE 5000

# Start the application and include auto-initialization of database schema
CMD ["sh", "-c", "npm run db:push && node dist/index.js"]
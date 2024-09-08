# Use the official Node.js base image
FROM node:16-alpine

# Set the working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Build app
RUN npm run build

# Install HTTP server
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]

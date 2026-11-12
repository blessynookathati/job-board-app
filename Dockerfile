
FROM node:20-alpine AS build

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Install client dependencies
COPY client/package*.json ./client/
RUN npm --prefix client install --legacy-peer-deps

# Copy project files
COPY . .

# Build React application
RUN npm run build

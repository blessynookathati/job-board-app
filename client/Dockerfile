
FROM node:20-alpine AS build

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Install client dependencies, including Vite
COPY client/package*.json ./client/
RUN npm --prefix client install --include=dev --legacy-peer-deps

# Copy project files
COPY . .

# Build frontend
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

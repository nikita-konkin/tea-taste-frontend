# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app

# Base URL of the backend API, baked into the CRA build.
# Defaults to /api so the serving proxy can route it to the backend.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Leverage caching by installing dependencies first.
# --legacy-peer-deps: @mui/x-date-pickers@7 declares a peer conflict with
# @mui/material@5.10; the lockfile is generated with the same flag.
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy the rest of the application code and build for production
COPY . ./
RUN npm run build

# Stage 2: Production environment
FROM nginx:alpine AS production

# Copy the production build artifacts from the build stage
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose the default NGINX port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

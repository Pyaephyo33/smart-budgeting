# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# backend/Dockerfile

# ----- Giai đoạn 1: Build -----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

RUN npm install

COPY . .

RUN npm run build -w backend


# ----- Giai đoạn 2: Production -----
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/backend/package.json ./package.json

RUN npm install --production

COPY --from=builder /app/backend/dist ./dist

CMD ["node", "dist/main"]
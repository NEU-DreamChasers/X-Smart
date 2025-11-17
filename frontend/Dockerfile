# frontend/Dockerfile

# ----- Giai đoạn 1: Build -----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

RUN npm install

COPY . .

RUN npm run build -w frontend


# ----- Giai đoạn 2: Production -----
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./.next/static
COPY --from=builder /app/frontend/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
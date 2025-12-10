FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY service-account.json ./

RUN npm install --ignore-scripts

COPY . .

RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY package*.json ./
COPY service-account.json ./

RUN npm install --only=production --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]
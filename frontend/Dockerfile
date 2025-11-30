FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy source code
COPY . .

# 4. Build Next.js (This creates .next/standalone because of next.config.js)
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# 5. Copy the standalone server and static files
# Next.js standalone build puts the necessary files in .next/standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
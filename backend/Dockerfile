FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files from the backend folder
COPY package*.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy the rest of the backend source code
COPY . .

# 4. Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# 5. Copy package.json again to install ONLY production dependencies
COPY package*.json ./

# 6. Install only production dependencies (saves space, fixes missing modules)
RUN npm install --only=production

# 7. Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]
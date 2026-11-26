# Stage 1: build the frontend
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client ./
RUN npm run build

# Stage 2: build the backend
FROM node:20-slim AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server ./
RUN npm run build

# Stage 3: slim runtime — Express serves both the API and the built frontend
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm install --omit=dev
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./client

EXPOSE 3000
CMD ["node", "dist/index.js"]

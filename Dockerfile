# syntax=docker/dockerfile:1

# ---- dependencies -------------------------------------------------------------
FROM node:24.22.2-alpine3.24 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- tests (docker build --target test .) --------------------------------------
FROM deps AS test
COPY . .
RUN npm test

# ---- production build ----------------------------------------------------------
FROM deps AS build
COPY . .
RUN npm run build

# ---- static server -------------------------------------------------------------
FROM nginx:1.31.8-alpine3.24 AS web
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

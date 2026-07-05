FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci --workspace=@newlight/web

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .
RUN npm run build --workspace=@newlight/web

FROM base AS runtime
COPY --from=build /app/apps/web/dist ./dist
EXPOSE 4321
CMD ["npx", "astro", "preview", "--port", "4321", "--host", "0.0.0.0"]

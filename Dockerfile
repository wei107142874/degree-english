FROM docker.m.daocloud.io/library/node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM docker.m.daocloud.io/library/node:24-alpine
WORKDIR /app
ENV HOST=0.0.0.0 PORT=4173
COPY server.mjs package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p data
EXPOSE 4173
CMD ["node", "server.mjs"]

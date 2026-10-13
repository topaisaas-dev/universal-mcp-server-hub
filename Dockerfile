FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev
COPY bin ./bin
COPY glama.json mcp.json smithery.yaml README.md LICENSE ./

ENV NODE_ENV=production

ENTRYPOINT ["node", "bin/cli.js"]

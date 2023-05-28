FROM node:18.16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# npm ci makes sure the exact versions in the lockfile gets installed
RUN npm ci --omit=dev
# Bundle app source
COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]
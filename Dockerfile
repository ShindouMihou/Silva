FROM node:17-alpine
WORKDIR /usr/src/app

# Copy all the package.json first.
COPY . .

# Install all the dependencies
RUN npm ci

# Build the production image.
RUN npm run build

EXPOSE 1210

CMD [ "node", "./build/server.js" ]

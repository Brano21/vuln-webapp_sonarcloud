
# Intentionally vulnerable / bad practices
FROM node:16-bullseye

# Run as root (bad), install extra packages (increase attack surface), no pinning
RUN apt-get update && apt-get install -y curl git && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy secrets into image (bad practice, on purpose)
COPY .env /usr/src/app/.env

# Copy package metadata separately (but still no lockfile pinning)
COPY app/package.json /usr/src/app/app/package.json

RUN cd /usr/src/app/app && npm install

# Copy the rest
COPY app /usr/src/app/app

EXPOSE 9000
CMD ["node", "app/server.js"]

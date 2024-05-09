# FIRST STAGE
FROM node:lts-alpine3.19 as prod-dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --production

# SECOND STAGE
FROM node:lts-alpine3.19 as runner
WORKDIR /app
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY app.js ./
COPY package.json ./
CMD [ "node", "app.js" ]

# Comando para correr la imagen en el contenedor:
# docker container run --interactive --tty <image>:<tag>
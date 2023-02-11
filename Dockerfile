FROM node:19

ENV NODE_ENV=production

COPY app.js app.js
COPY package.json package.json
COPY application.yaml application.yaml
COPY processors processors
COPY routes routes
COPY bin bin

RUN npm install

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "npm start"]

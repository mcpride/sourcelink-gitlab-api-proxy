FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production

COPY . .

ENV GITLAB_URL "https://gitlab.com"
ENV GITLAB_PRIVATE_TOKEN ""
EXPOSE 6219
CMD [ "node", "sourcelink-gitlab-api-proxy.js" ]
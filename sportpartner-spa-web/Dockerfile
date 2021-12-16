FROM node:10.20.1-alpine AS client
WORKDIR /app
EXPOSE 4200

RUN npm --unsafe-perm install -g @angular/cli@9.0.2
RUN npm --unsafe-perm install -g node-sass

WORKDIR /app
CMD ["ng", "serve", "--port", "4200", "--host", "0.0.0.0", "--disable-host-check", "--poll", "2000", "--base-href", "/", "--deploy-url", "/spa-web/"]

#### build ####

FROM node:16 as builder
RUN mkdir /app
ADD src/ /app/src
ADD public/ /app/public
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm install
RUN npm run build
RUN apt update
RUN npm run gzip

#### final ####

FROM node:16-alpine
RUN npm install -g node-static
COPY --from=builder /app/build/ /app

CMD ["static","app","-a","0.0.0.0","--cache", "2628000", "--gzip"]

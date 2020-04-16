FROM node:12.9.1
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN yarn
COPY . /app
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]

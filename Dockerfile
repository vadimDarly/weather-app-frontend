FROM node:12.9.1
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm i
COPY . /app
EXPOSE 4200
CMD ["npm", "start", "--host", "0.0.0.0"]

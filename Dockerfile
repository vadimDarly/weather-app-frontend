FROM node:12.16.2
#RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./
RUN npm install -g @angular/cli@8.2.2
RUN npm install @angular-devkit/build-angular@0.803.25
RUN npm install
COPY . .
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]

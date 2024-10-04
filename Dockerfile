FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./src ./src
COPY ./public ./public
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
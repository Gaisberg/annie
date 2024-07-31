FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install
COPY ./src ./src
COPY ./public ./public
RUN pnpm run build
RUN pnpm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
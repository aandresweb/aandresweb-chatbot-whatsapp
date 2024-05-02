# THIS IS THE BASE IMAGE FOR THE BOT
FROM node:21-alpine3.18 as builder

# Enable Corepack and prepare for PNPM installation to increase performance
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml files to the working directory
COPY package*.json ./

# Install dependencies using PNPM
COPY . .
RUN npm i

# Create a new stage for deployment
FROM builder as deploy

# Copy only necessary files and directories for deployment
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json  ./

RUN npm install
CMD ["pnpm", "start"]

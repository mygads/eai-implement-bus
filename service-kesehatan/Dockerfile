FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY index.js .
COPY seed_data.js .
COPY seed.js .

EXPOSE 3000

CMD ["node", "index.js"]

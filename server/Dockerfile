FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Use production env
ENV NODE_ENV=production

# Expose app port
EXPOSE 3000

# Start app
CMD [ "node", "app.js" ]

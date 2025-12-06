FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Set proper permissions
RUN chmod -R 755 /app

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
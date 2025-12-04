# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /marketing

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install nest
RUN npm config set registry https://registry.npmmirror.com/

# Install app dependencies
RUN npm install --force

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose 
EXPOSE 3001

# Start the server using the production build
CMD ["npm", "run", "start"]
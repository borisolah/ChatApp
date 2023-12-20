# Use an official Node runtime as a parent image
FROM node:21.4.0

# Set the working directory in the container
WORKDIR /usr/src/chatserver

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Your app binds to a specific port, make sure to expose it
EXPOSE 3001

# Define the command to run your app
CMD [ "node", "server.js" ]


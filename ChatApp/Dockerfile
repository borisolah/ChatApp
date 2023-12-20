# Stage 1: Build the React application
FROM node:21.4.0 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
ARG REACT_APP_CHAT_SERVER_URL
ENV REACT_APP_CHAT_SERVER_URL=$REACT_APP_CHAT_SERVER_URL
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:latest as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app/

RUN npm run build

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:latest

# Install gettext package for envsubst command
RUN apt-get update && apt-get install -y gettext

# Copy the nginx.conf.template and create the actual nginx.conf file
COPY /.nginx/nginx.conf.template /etc/nginx/conf.d/default.template
CMD /bin/bash -c "envsubst '\$VITE_API_USER_CREATE_URL \$VITE_API_USER_READ_URL \$VITE_API_USER_UPDATE_URL \$VITE_API_USER_DELETE_URL \$VITE_API_STOP_CREATE_URL \$VITE_API_STOP_READ_URL \$VITE_API_STOP_UPDATE_URL \$VITE_API_STOP_DELETE_URL \$VITE_API_TIMETABLE_CREATE_URL \$VITE_API_TIMETABLE_READ_URL \$VITE_API_TIMETABLE_UPDATE_URL \$VITE_API_TIMETABLE_DELETE_URL \$VITE_API_LOGIN_URL \$VITE_API_REFRESH_TOKEN_URL \$VITE_SECRET_KEY' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"

# Copy the compiled app
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

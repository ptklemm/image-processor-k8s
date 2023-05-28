FROM node:18.16-alpine as build-react-gui
COPY ./react-gui .
# npm ci makes sure the exact versions in the lockfile gets installed
RUN npm ci 
RUN npm run build


FROM nginx:alpine
#!/bin/sh
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-react-gui /build /usr/share/nginx/html
EXPOSE 3000 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
FROM node:18.16-alpine as react-builder
COPY . .
# npm ci makes sure the exact versions in the lockfile gets installed
RUN npm ci 
RUN npm run build


FROM nginx:alpine
#!/bin/sh
COPY ./nginx.conf /etc/nginx/nginx.conf
## Remove default nginx index page
# RUN rm -rf /usr/share/nginx/html/*
COPY --from=react-builder /build /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
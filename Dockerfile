FROM node:20-alpine AS builder

WORKDIR /app

COPY conecta-pet-angular/package*.json ./
RUN npm install

COPY conecta-pet-angular/ ./
RUN npm run build --configuration=production

FROM nginx:alpine

COPY --from=builder /app/dist/conecta-pet/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
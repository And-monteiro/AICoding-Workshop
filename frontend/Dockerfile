FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Test runner: `docker compose ... run --rm frontend-tests` builds this stage.
# It is never part of the production image (the last stage below is).
FROM deps AS test
COPY . .
CMD ["npm", "test"]

FROM deps AS build
COPY . .
ARG VITE_API_URL
ARG VITE_APP_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

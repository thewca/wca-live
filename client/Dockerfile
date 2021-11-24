# Stage 1: build
FROM node:14.18.1-alpine3.14 AS build

WORKDIR /app

# Install npm dependencies.
COPY package*.json ./
RUN npm ci --only prod --progress false --loglevel error --no-audit

# Build artificats.
COPY . .
RUN npm run build

# Stage 2: final image
FROM alpine:3.14.2

WORKDIR /app

# Copy build artifacts into the current directory.
COPY --from=build /app/build .

# Once run, this copies all the build artifacts to /build.
# If /build is a mounted docker volume, all the files are
# copied there and another container may use them.
CMD [ "cp", "-rT", ".", "/build" ]

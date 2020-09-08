# Stage 1: build
FROM node:14-alpine AS build

WORKDIR /app

# Install npm dependencies.
COPY package*.json ./
RUN npm ci --silent--progress=false --no-audit --loglevel=error

# Build artificats.
COPY . .
RUN npm run build

# Stage 2: final image
FROM alpine:3.12

WORKDIR /app

# Copy build artifacts into the current directory.
COPY --from=build /app/build .

# Once run, this copies all the build artifacts to /build.
# If /build is a mounted docker volume, all the files are
# copied there and another container may use them.
CMD [ "cp", "-rT", ".", "/build" ]

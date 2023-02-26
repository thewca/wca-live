# Stage 1: build
FROM hexpm/elixir:1.12.3-erlang-24.1.6-alpine-3.14.2 AS build

# Install build dependencies
RUN apk add --no-cache build-base git python3 nodejs npm

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV
ENV MIX_ENV=prod

# Install mix dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix do deps.get, deps.compile

COPY client client

# Compile client assets
RUN mix do client.setup, client.build

# Compile and build release
COPY rel rel
COPY priv priv
COPY lib lib
RUN mix do compile, release

# Stage 2: release image
FROM alpine:3.14.2

# Install runtime dependencies
RUN apk add --no-cache \
    # Runtime
    openssl ncurses-libs \
    # PDF generation
    ttf-freefont wkhtmltopdf \
    # Getting node IP in env.sh
    curl jq

WORKDIR /app

# Copy the release build from the previous stage.
COPY --from=build /app/_build/prod/rel/wca_live ./

ENV HOME=/app

CMD ["/app/bin/server"]

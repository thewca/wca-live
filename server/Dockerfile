# Stage 1: build
FROM hexpm/elixir:1.11.4-erlang-23.3.4-alpine-3.13.3 AS build

# Install build dependencies.
RUN apk add --no-cache build-base git python3

WORKDIR /app

# Install hex and rebar.
RUN mix local.hex --force && \
    mix local.rebar --force

# Set build ENV.
ENV MIX_ENV=prod

# Install mix dependencies.
COPY mix.exs mix.lock ./
COPY config config
RUN mix do deps.get, deps.compile

# Compile and build release.
COPY priv priv
COPY lib lib
RUN mix do compile, release

# Stage 2: release image
FROM alpine:3.12

# Install dependencies.
RUN apk add --no-cache \
    # runtime
    openssl ncurses-libs \
    # PDF generation
    ttf-ubuntu-font-family wkhtmltopdf

WORKDIR /app

# Copy the release build from the previous stage.
COPY --from=build /app/_build/prod/rel/wca_live ./

ENV HOME=/app

COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT [ "/docker-entrypoint.sh" ]
CMD [ "start" ]
